param(
    [string]$ReferenceRoot = (Join-Path $PSScriptRoot "..\\references\\vendor-prospects")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Import-BatchRows {
    param(
        [Parameter(Mandatory = $true)][string[]]$Patterns,
        [Parameter(Mandatory = $true)][string]$Lane
    )

    $headers = @(
        "display_name",
        "website_url",
        "source_url",
        "primary_metro",
        "service_area",
        "contact_name",
        "email",
        "phone",
        "evidence"
    )

    @(foreach ($pattern in $Patterns) {
            Get-ChildItem -Path $ReferenceRoot -Filter $pattern
        }) |
        Sort-Object Name |
        ForEach-Object {
            $file = $_.FullName
            $firstLine = Get-Content -Path $file -TotalCount 1
            $csvRows = if ($firstLine -like "display_name|website_url|source_url|*") {
                Import-Csv -Delimiter "|" -Path $file
            } else {
                Import-Csv -Delimiter "|" -Header $headers -Path $file
            }
            $csvRows | ForEach-Object {
                [pscustomobject]@{
                    lane          = $Lane
                    batch_file    = [System.IO.Path]::GetFileName($file)
                    display_name  = $_.display_name
                    website_url   = $_.website_url
                    source_url    = $_.source_url
                    primary_metro = $_.primary_metro
                    service_area  = $_.service_area
                    contact_name  = $_.contact_name
                    email         = $_.email
                    phone         = $_.phone
                    evidence      = $_.evidence
                }
            }
        }
}

function Find-Duplicates {
    param(
        [Parameter(Mandatory = $true)]$Rows,
        [Parameter(Mandatory = $true)][string]$PropertyName
    )

    $Rows |
        Where-Object { $_.$PropertyName -and $_.$PropertyName.Trim().Length -gt 0 } |
        Group-Object -Property $PropertyName |
        Where-Object Count -gt 1 |
        Sort-Object Name
}

function Add-Issue {
    param(
        [Parameter(Mandatory = $true)]$Issues,
        [Parameter(Mandatory = $true)]$Row,
        [Parameter(Mandatory = $true)][string]$Reason
    )

    $Issues.Add([pscustomobject]@{
            lane         = $Row.lane
            batch_file   = $Row.batch_file
            display_name = $Row.display_name
            reason       = $Reason
        }) | Out-Null
}

function Get-SuspiciousRows {
    param(
        [Parameter(Mandatory = $true)]$Rows
    )

    $issues = [System.Collections.Generic.List[object]]::new()
    $phoneRegex = '^\+?\d[\d\-\(\)\s]{6,}$'
    $emailRegex = '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'

    foreach ($row in $Rows) {
        if (-not $row.display_name) {
            Add-Issue -Issues $issues -Row $row -Reason "missing display_name"
        }
        if (-not $row.source_url) {
            Add-Issue -Issues $issues -Row $row -Reason "missing source_url"
        }
        if (-not $row.evidence -or $row.evidence.Trim().Length -lt 40) {
            Add-Issue -Issues $issues -Row $row -Reason "weak evidence text"
        }
        if ($row.evidence -match $phoneRegex) {
            Add-Issue -Issues $issues -Row $row -Reason "evidence looks like a phone number (possible column shift)"
        }
        if ($row.contact_name -match $emailRegex) {
            Add-Issue -Issues $issues -Row $row -Reason "contact_name looks like an email (possible column shift)"
        }
        if ($row.phone -and $row.phone -match $emailRegex) {
            Add-Issue -Issues $issues -Row $row -Reason "phone looks like an email (possible column shift)"
        }

        if ($row.lane -eq "send-ready") {
            if (-not $row.email) {
                Add-Issue -Issues $issues -Row $row -Reason "send-ready row missing email"
            } elseif ($row.email -notmatch $emailRegex) {
                Add-Issue -Issues $issues -Row $row -Reason "send-ready row has invalid email"
            }
        }
    }

    $issues
}

$sendReadyRows = @(Import-BatchRows -Patterns @("us-expansion-send-ready-batch-*.tsv", "texas-mvp-send-ready.tsv") -Lane "send-ready")
$researchRows = @(Import-BatchRows -Patterns @("us-expansion-needs-enrichment-batch-*.tsv", "texas-mvp-needs-enrichment.tsv") -Lane "research")
$allRows = @($sendReadyRows + $researchRows)

Write-Host ""
Write-Host "Vendor Prospect Batch Audit"
Write-Host "Reference root: $ReferenceRoot"
Write-Host ""

Write-Host "Counts"
[pscustomobject]@{
    send_ready_batches = (@($sendReadyRows | Select-Object -ExpandProperty batch_file -Unique)).Count
    send_ready_rows    = $sendReadyRows.Count
    research_batches   = (@($researchRows | Select-Object -ExpandProperty batch_file -Unique)).Count
    research_rows      = $researchRows.Count
    total_rows         = $allRows.Count
} | Format-Table -AutoSize

Write-Host ""
Write-Host "Duplicate Summary"
[pscustomobject]@{
    send_display_name  = @(Find-Duplicates -Rows $sendReadyRows -PropertyName "display_name").Count
    send_website_url   = @(Find-Duplicates -Rows $sendReadyRows -PropertyName "website_url").Count
    send_source_url    = @(Find-Duplicates -Rows $sendReadyRows -PropertyName "source_url").Count
    research_display   = @(Find-Duplicates -Rows $researchRows -PropertyName "display_name").Count
    research_website   = @(Find-Duplicates -Rows $researchRows -PropertyName "website_url").Count
    research_source    = @(Find-Duplicates -Rows $researchRows -PropertyName "source_url").Count
    cross_lane_website = @(($allRows | Where-Object website_url | Group-Object website_url | Where-Object Count -gt 1)).Count
    cross_lane_source  = @(($allRows | Group-Object source_url | Where-Object Count -gt 1)).Count
} | Format-Table -AutoSize

$suspiciousRows = @(Get-SuspiciousRows -Rows $allRows)
Write-Host ""
Write-Host "Suspicious Rows: $($suspiciousRows.Count)"
if ($suspiciousRows.Count -gt 0) {
    $suspiciousRows | Sort-Object lane, batch_file, display_name | Format-Table -AutoSize
}

Write-Host ""
Write-Host "Cross-Lane Website Duplicates"
$crossLaneWebsite = @($allRows |
    Where-Object website_url |
    Group-Object website_url |
    Where-Object Count -gt 1 |
    Sort-Object Name)
if ($crossLaneWebsite.Count -eq 0) {
    Write-Host "none"
} else {
    foreach ($group in $crossLaneWebsite) {
        $group.Group | Select-Object lane, batch_file, display_name, website_url | Format-Table -AutoSize
    }
}

Write-Host ""
Write-Host "Cross-Lane Source Duplicates"
$crossLaneSource = @($allRows |
    Group-Object source_url |
    Where-Object Count -gt 1 |
    Sort-Object Name)
if ($crossLaneSource.Count -eq 0) {
    Write-Host "none"
} else {
    foreach ($group in $crossLaneSource) {
        $group.Group | Select-Object lane, batch_file, display_name, source_url | Format-Table -AutoSize
    }
}
