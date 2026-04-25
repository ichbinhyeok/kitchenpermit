param(
    [Parameter(Mandatory = $true)][string]$BatchFile,
    [string]$ReferenceRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not $ReferenceRoot) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $ReferenceRoot = Join-Path $scriptDir "..\\references\\vendor-prospects"
}

function Import-Rows {
    param(
        [Parameter(Mandatory = $true)][string[]]$Files,
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

    foreach ($file in $Files) {
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

function Add-Issue {
    param(
        [Parameter(Mandatory = $true)]$Issues,
        [Parameter(Mandatory = $true)][string]$Scope,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)]$Rows
    )

    $Issues.Add([pscustomobject]@{
            scope   = $Scope
            reason  = $Reason
            matches = @($Rows | ForEach-Object { "$($_.batch_file): $($_.display_name)" }) -join "; "
        }) | Out-Null
}

function Find-Duplicates {
    param(
        [Parameter(Mandatory = $true)]$Rows,
        [Parameter(Mandatory = $true)][string]$PropertyName
    )

    @($Rows |
        Where-Object { $_.$PropertyName -and $_.$PropertyName.Trim().Length -gt 0 } |
        Group-Object -Property $PropertyName |
        Where-Object Count -gt 1 |
        Sort-Object Name)
}

function Get-SuspiciousRows {
    param(
        [Parameter(Mandatory = $true)]$Rows,
        [Parameter(Mandatory = $true)][string]$Lane
    )

    $issues = [System.Collections.Generic.List[object]]::new()
    $phoneRegex = '^\+?\d[\d\-\(\)\s]{6,}$'
    $emailRegex = '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'

    foreach ($row in $Rows) {
        if (-not $row.display_name) {
            $issues.Add([pscustomobject]@{ row = $row; reason = "missing display_name" }) | Out-Null
        }
        if (-not $row.source_url) {
            $issues.Add([pscustomobject]@{ row = $row; reason = "missing source_url" }) | Out-Null
        }
        if (-not $row.evidence -or $row.evidence.Trim().Length -lt 40) {
            $issues.Add([pscustomobject]@{ row = $row; reason = "weak evidence text" }) | Out-Null
        }
        if ($row.evidence -match $phoneRegex) {
            $issues.Add([pscustomobject]@{ row = $row; reason = "evidence looks like a phone number (possible column shift)" }) | Out-Null
        }
        if ($row.contact_name -match $emailRegex) {
            $issues.Add([pscustomobject]@{ row = $row; reason = "contact_name looks like an email (possible column shift)" }) | Out-Null
        }
        if ($row.phone -and $row.phone -match $emailRegex) {
            $issues.Add([pscustomobject]@{ row = $row; reason = "phone looks like an email (possible column shift)" }) | Out-Null
        }
        if ($Lane -eq "send-ready") {
            if (-not $row.email) {
                $issues.Add([pscustomobject]@{ row = $row; reason = "send-ready row missing email" }) | Out-Null
            } elseif ($row.email -notmatch $emailRegex) {
                $issues.Add([pscustomobject]@{ row = $row; reason = "send-ready row has invalid email" }) | Out-Null
            }
        }
    }

    $issues
}

$resolvedBatch = Resolve-Path -LiteralPath $BatchFile
$batchName = [System.IO.Path]::GetFileName($resolvedBatch)

$sendPatterns = @("us-expansion-send-ready-batch-*.tsv", "texas-mvp-send-ready.tsv")
$researchPatterns = @("us-expansion-needs-enrichment-batch-*.tsv", "texas-mvp-needs-enrichment.tsv")

if ($batchName -like "us-expansion-send-ready-batch-*.tsv" -or $batchName -eq "texas-mvp-send-ready.tsv") {
    $lane = "send-ready"
    $lanePatterns = $sendPatterns
    $otherLanePatterns = $researchPatterns
} elseif ($batchName -like "us-expansion-needs-enrichment-batch-*.tsv" -or $batchName -eq "texas-mvp-needs-enrichment.tsv") {
    $lane = "research"
    $lanePatterns = $researchPatterns
    $otherLanePatterns = $sendPatterns
} else {
    throw "Unsupported batch file naming convention: $batchName"
}

$laneFiles = @(foreach ($pattern in $lanePatterns) { Get-ChildItem -Path $ReferenceRoot -Filter $pattern | Select-Object -ExpandProperty FullName })
$otherLaneFiles = @(foreach ($pattern in $otherLanePatterns) { Get-ChildItem -Path $ReferenceRoot -Filter $pattern | Select-Object -ExpandProperty FullName })
$baselineLaneFiles = @($laneFiles | Where-Object { (Resolve-Path -LiteralPath $_).Path -ne $resolvedBatch.Path })

$targetRows = @(Import-Rows -Files @($resolvedBatch.Path) -Lane $lane)
$baselineRows = @(Import-Rows -Files $baselineLaneFiles -Lane $lane)
$crossLaneRows = @(Import-Rows -Files $otherLaneFiles -Lane ($(if ($lane -eq "send-ready") { "research" } else { "send-ready" })))

$issues = [System.Collections.Generic.List[object]]::new()

foreach ($property in @("display_name", "website_url", "source_url")) {
    foreach ($group in Find-Duplicates -Rows $targetRows -PropertyName $property) {
        Add-Issue -Issues $issues -Scope "target" -Reason "duplicate $property inside target batch: $($group.Name)" -Rows $group.Group
    }
}

foreach ($property in @("display_name", "website_url", "source_url")) {
    foreach ($row in $targetRows) {
        $value = $row.$property
        if (-not $value -or $value.Trim().Length -eq 0) {
            continue
        }

        $sameLaneMatches = @($baselineRows | Where-Object { $_.$property -eq $value })
        if ($sameLaneMatches.Count -gt 0) {
            Add-Issue -Issues $issues -Scope "same-lane" -Reason "duplicate $property already locked: $value" -Rows @($row) + $sameLaneMatches
        }

        if ($property -in @("website_url", "source_url")) {
            $crossLaneMatches = @($crossLaneRows | Where-Object { $_.$property -eq $value })
            if ($crossLaneMatches.Count -gt 0) {
                Add-Issue -Issues $issues -Scope "cross-lane" -Reason "duplicate $property already exists in other lane: $value" -Rows @($row) + $crossLaneMatches
            }
        }
    }
}

foreach ($issue in Get-SuspiciousRows -Rows $targetRows -Lane $lane) {
    Add-Issue -Issues $issues -Scope "target" -Reason $issue.reason -Rows @($issue.row)
}

Write-Host ""
Write-Host "Vendor Prospect Batch Validation"
Write-Host "Batch: $batchName"
Write-Host "Lane: $lane"
Write-Host "Rows: $($targetRows.Count)"
Write-Host ""

if ($issues.Count -eq 0) {
    Write-Host "PASS: no duplicate or suspicious rows found."
    exit 0
}

Write-Host "FAIL: $($issues.Count) issue(s) found."
$issues | Format-Table -AutoSize
exit 1
