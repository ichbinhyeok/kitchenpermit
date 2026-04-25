package owner.hood.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import owner.hood.domain.outbound.OwnerContactStatus;
import owner.hood.domain.outbound.VendorProspect;
import owner.hood.domain.outbound.ProspectStatus;
import owner.hood.domain.vendor.DocumentationMaturity;
import owner.hood.domain.vendor.OwnershipStyle;
import owner.hood.application.outbound.VendorProspectEnrichmentForm;
import owner.hood.application.outbound.VendorProspectEnrichmentResultView;
import owner.hood.application.outbound.VendorProspectEnrichmentService;
import owner.hood.application.outbound.OutboundOpsService;
import owner.hood.application.outbound.VendorProspectImportForm;
import owner.hood.application.outbound.VendorProspectImportResultView;
import owner.hood.application.outbound.VendorProspectSourcingService;
import owner.hood.infrastructure.persistence.VendorProspectRepository;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class VendorProspectSourcingFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private VendorProspectRepository vendorProspectRepository;

    @Autowired
    private VendorProspectSourcingService vendorProspectSourcingService;

    @Autowired
    private OutboundOpsService outboundOpsService;

    @Autowired
    private VendorProspectEnrichmentService vendorProspectEnrichmentService;

    @Test
    void sendReadySeedFilePassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "texas-mvp-send-ready.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);

        assertThat(result.processedCount()).isEqualTo(11);
        assertThat(result.importedCount()).isEqualTo(11);
        assertThat(result.rejectedCount()).isZero();

        Set<String> seedNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> seedNames.contains(prospect.getDisplayName()))
                .toList();
        Map<String, Long> byMetro = prospects.stream()
                .collect(Collectors.groupingBy(VendorProspect::getPrimaryMetro, Collectors.counting()));
        assertThat(prospects).hasSize(11);
        assertThat(byMetro)
                .containsEntry("Austin", 4L)
                .containsEntry("DFW", 4L)
                .containsEntry("San Antonio", 3L);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getPrimaryOfferAxis()).isIn("AXIS_1", "AXIS_2");
                });

        VendorProspect bowmar = prospects.stream()
                .filter(prospect -> "Bowmar Industrial Services".equals(prospect.getDisplayName()))
                .findFirst()
                .orElseThrow();
        assertThat(bowmar.getPrimaryOfferAxis()).isEqualTo("AXIS_2");
        assertThat(bowmar.getServiceAreaOverlapStatus()).isEqualTo("ACTIVE_AXIS2_OVERLAP");

        VendorProspect abrams = prospects.stream()
                .filter(prospect -> "Abrams Hood Exhaust Cleaning".equals(prospect.getDisplayName()))
                .findFirst()
                .orElseThrow();
        assertThat(abrams.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
        assertThat(abrams.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
    }

    @Test
    void usExpansionSendReadyBatchPassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-001.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(41);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(41);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(41);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch002PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-002.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(25);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(25);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(25);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch003PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-003.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(25);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(25);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(25);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch004PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-004.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(25);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(25);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(25);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch005PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-005.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(25);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(25);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(25);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch006PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-006.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(26);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(26);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(26);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch007PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-007.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(25);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(25);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(25);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch008PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-008.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(26);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(26);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(26);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch009PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-009.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(27);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(27);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(27);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch010PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-010.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(25);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(25);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(25);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch011PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-011.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(25);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(25);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(25);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch012PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-012.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(25);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(25);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(25);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch013PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-013.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(42);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(42);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(42);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch014PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-014.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(15);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(15);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(15);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch015PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-015.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(26);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(26);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(26);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch016PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-016.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(24);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(24);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(24);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch017PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-017.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(10);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(10);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(10);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch018PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-018.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(13);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(13);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(13);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch019PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-019.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(8);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(8);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(8);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch020PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-020.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(10);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(10);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(10);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionSendReadyBatch021PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-021.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(2);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(3);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch001ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-001.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(2);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(4);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        prospects.forEach(prospect -> assertThat(csv).doesNotContain(prospect.getSourceUrl()));
    }

    @Test
    void usExpansionSendReadyBatch022PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-022.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(2);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(3);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch002ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-002.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(1);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(2);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        prospects.forEach(prospect -> assertThat(csv).doesNotContain(prospect.getSourceUrl()));
    }

    @Test
    void usExpansionSendReadyBatch023PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-023.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(8);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(8);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(8);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch003ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-003.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(9);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(9);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(9);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        prospects.forEach(prospect -> assertThat(csv).doesNotContain(prospect.getSourceUrl()));
    }

    @Test
    void usExpansionSendReadyBatch024PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-024.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(3);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch004ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-004.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(1);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(1);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        batchNames.forEach(name -> assertThat(csv).doesNotContain(name));
    }

    @Test
    void usExpansionSendReadyBatch025PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-025.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(7);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(7);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(7);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch005ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-005.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(9);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(9);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(9);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        batchNames.forEach(name -> assertThat(csv).doesNotContain(name));
    }

    @Test
    void usExpansionSendReadyBatch026PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-026.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(2);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(2);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch006ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-006.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(3);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        prospects.forEach(prospect -> assertThat(csv).doesNotContain(prospect.getSourceUrl()));
    }

    @Test
    void usExpansionSendReadyBatch027PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-027.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(8);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(8);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(8);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch007ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-007.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(9);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(9);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(9);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        prospects.forEach(prospect -> assertThat(csv).doesNotContain(prospect.getSourceUrl()));
    }

    @Test
    void usExpansionSendReadyBatch028PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-028.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(6);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(6);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(6);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch008ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-008.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(1);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(1);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        prospects.forEach(prospect -> assertThat(csv).doesNotContain(prospect.getSourceUrl()));
    }

    @Test
    void usExpansionSendReadyBatch029PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-029.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(6);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(6);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(6);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch009ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-009.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(3);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        prospects.forEach(prospect -> assertThat(csv).doesNotContain(prospect.getSourceUrl()));
    }

    @Test
    void usExpansionSendReadyBatch030PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-030.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(4);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch010ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-010.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(2);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(2);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        prospects.forEach(prospect -> assertThat(csv).doesNotContain(prospect.getSourceUrl()));
    }

    @Test
    void usExpansionSendReadyBatch031PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-031.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(8);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(8);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(8);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch011ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-011.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(3);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        prospects.forEach(prospect -> assertThat(csv).doesNotContain(prospect.getSourceUrl()));
    }

    @Test
    @Transactional
    void usExpansionEnrichmentBatch001PromotesMountaineerToActive() throws Exception {
        VendorProspectImportForm importForm = new VendorProspectImportForm();
        importForm.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-003.tsv"
        )));

        VendorProspectImportResultView importResult = vendorProspectSourcingService.importCandidates(importForm);
        assertThat(importResult.processedCount()).isEqualTo(9);
        assertThat(importResult.importedCount()).isEqualTo(9);
        assertThat(importResult.rejectedCount()).isZero();

        VendorProspectEnrichmentForm enrichmentForm = new VendorProspectEnrichmentForm();
        enrichmentForm.setEnrichmentRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-enrichment-batch-001.tsv"
        )));

        VendorProspectEnrichmentResultView result = vendorProspectEnrichmentService.enrichCandidates(enrichmentForm);

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.updatedCount()).isEqualTo(1);
        assertThat(result.rejectedCount()).isZero();
        assertThat(result.rows())
                .singleElement()
                .satisfies(row -> {
                    assertThat(row.decision()).isEqualTo("promoted");
                    assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
                });

        VendorProspect promoted = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> "Mountaineer Hood and Exhaust Cleaning, LLC".equals(prospect.getDisplayName()))
                .findFirst()
                .orElseThrow();

        assertThat(promoted.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(promoted.getEmail()).isEqualTo("mountaineerhoodandexhaust@gmail.com");
        assertThat(promoted.getContactSourceUrl()).isEqualTo("https://mountaineerhoodandexhaust.com/contact");
        assertThat(promoted.getNotes()).contains("Research enrichment pass");

        String csv = new String(outboundOpsService.exportProspectsCsv());
        assertThat(csv).contains("Mountaineer Hood and Exhaust Cleaning, LLC");
        assertThat(csv).contains("mountaineerhoodandexhaust@gmail.com");
    }

    @Test
    @Transactional
    void usExpansionEnrichmentBatch002PromotesVelocityAndMcCleanersToActive() throws Exception {
        VendorProspectImportForm importForm = new VendorProspectImportForm();
        importForm.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-011.tsv"
        )) + System.lineSeparator() + Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-016.tsv"
        )));

        VendorProspectImportResultView importResult = vendorProspectSourcingService.importCandidates(importForm);
        assertThat(importResult.processedCount()).isEqualTo(5);
        assertThat(importResult.importedCount()).isEqualTo(5);
        assertThat(importResult.rejectedCount()).isZero();

        VendorProspectEnrichmentForm enrichmentForm = new VendorProspectEnrichmentForm();
        enrichmentForm.setEnrichmentRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-enrichment-batch-002.tsv"
        )));

        VendorProspectEnrichmentResultView result = vendorProspectEnrichmentService.enrichCandidates(enrichmentForm);

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.updatedCount()).isEqualTo(2);
        assertThat(result.rejectedCount()).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.decision()).isEqualTo("promoted");
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
        });

        VendorProspect velocity = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> "Velocity Hood Cleaning".equals(prospect.getDisplayName()))
                .findFirst()
                .orElseThrow();
        assertThat(velocity.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(velocity.getEmail()).isEqualTo("steven@velocityhoodcleaning.com");
        assertThat(velocity.getContactSourceUrl()).isEqualTo("https://velocityhoodcleaning.com/contact");

        VendorProspect mccleaners = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> "McCleaners Restaurant Services".equals(prospect.getDisplayName()))
                .findFirst()
                .orElseThrow();
        assertThat(mccleaners.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(mccleaners.getEmail()).isEqualTo("mccleanerscustomer@gmail.com");
        assertThat(mccleaners.getContactSourceUrl()).isEqualTo("https://www.mccleanersrestaurantservices.com/");

        String csv = new String(outboundOpsService.exportProspectsCsv());
        assertThat(csv).contains("Velocity Hood Cleaning");
        assertThat(csv).contains("steven@velocityhoodcleaning.com");
        assertThat(csv).contains("McCleaners Restaurant Services");
        assertThat(csv).contains("mccleanerscustomer@gmail.com");
    }

    @Test
    @Transactional
    void usExpansionEnrichmentBatch003PromotesWesternStatesAndRogueToActive() throws Exception {
        VendorProspectImportForm importForm = new VendorProspectImportForm();
        importForm.setCandidateRows("""
                Rogue Hood & Fire|https://www.roguehoodcleaning.com/|https://www.roguehoodcleaning.com/|Medford|Medford, Central Point, Ashland, Grants Pass, and Jackson County commercial kitchens|||541-613-0913|Official site presents Rogue Hood and Fire as an owner-operated Southern Oregon partner focused on restaurant hood cleaning, fire suppression systems, extinguisher services, grease trap service, and filter exchange for Jackson County commercial kitchens, but no usable public business email is visibly published.
                Western States Exhaust Cleaning|https://westernstatesexhaustcleaning.com/|https://westernstatesexhaustcleaning.com/|Honolulu|Honolulu and island-wide Oahu commercial kitchens|||808-207-7677|Official site positions Western States Exhaust Cleaning as a Honolulu kitchen hood cleaning company specializing in NFPA 96 compliant commercial kitchen exhaust service across Oahu, but the public route is still phone and form rather than a visibly usable business inbox.
                """);

        VendorProspectImportResultView importResult = vendorProspectSourcingService.importCandidates(importForm);
        assertThat(importResult.processedCount()).isEqualTo(2);
        assertThat(vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(VendorProspect::getDisplayName)
                .collect(Collectors.toSet()))
                .contains("Western States Exhaust Cleaning", "Rogue Hood & Fire");

        VendorProspectEnrichmentForm enrichmentForm = new VendorProspectEnrichmentForm();
        enrichmentForm.setEnrichmentRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-enrichment-batch-003.tsv"
        )));

        VendorProspectEnrichmentResultView result = vendorProspectEnrichmentService.enrichCandidates(enrichmentForm);

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.updatedCount()).isEqualTo(2);
        assertThat(result.rejectedCount()).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.decision()).isEqualTo("promoted");
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
        });

        Map<String, VendorProspect> prospectsByName = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> "Western States Exhaust Cleaning".equals(prospect.getDisplayName())
                        || "Rogue Hood & Fire".equals(prospect.getDisplayName()))
                .collect(Collectors.toMap(VendorProspect::getDisplayName, prospect -> prospect, (left, right) -> left));

        assertThat(prospectsByName).containsKeys("Western States Exhaust Cleaning", "Rogue Hood & Fire");
        assertThat(prospectsByName.get("Western States Exhaust Cleaning").getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(prospectsByName.get("Western States Exhaust Cleaning").getEmail()).isEqualTo("info@westernstatesexhaustcleaning.com");
        assertThat(prospectsByName.get("Rogue Hood & Fire").getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(prospectsByName.get("Rogue Hood & Fire").getEmail()).isEqualTo("roguehoodcleaning@gmail.com");
    }

    @Test
    @Transactional
    void usExpansionEnrichmentBatch004PromotesSuperEliteAndHoustonToActive() throws Exception {
        VendorProspectImportForm importForm = new VendorProspectImportForm();
        importForm.setCandidateRows("""
                Super Hood Cleaning|https://superhoodcleaning.com/|https://content.boston.gov/sites/default/files/file/2026/03/2026%20Registered%20Hood%20Cleaners.pdf#page=6-super-hood|North Jersey|Haskell, North Jersey, and nearby New York City commercial kitchens|||781-821-0980|Boston's 2026 registered hood cleaners list names Super Hood Cleaning directly, and the official site is a hood-only brand focused on commercial kitchen exhaust cleaning with a live public phone route but no visible public inbox.
                Elite Hood Cleaning Service|https://www.elitehoodcleaningservice.com/|https://www.elitehoodcleaningservice.com/|Greenville|Greenville, Goldsboro, New Bern, Jacksonville, and nearby Eastern North Carolina commercial kitchens|||252-210-4554|Official site title says kitchen exhaust cleaning and commercial and restaurant hood cleaning, explicitly references NFPA 96 and commercial kitchen service, and publishes a direct phone route for eastern North Carolina without a visible public inbox.
                Houston Hood Cleaning|https://www.houstonhoodcleaning.net/|https://www.houstonhoodcleaning.net/|Houston|Houston, Pasadena, Pearland, Sugar Land, and nearby Greater Houston commercial kitchens|||832-880-1338|Official site title says Best Hood Cleaning Texas, references NFPA 96, before-and-after proof, and commercial kitchen exhaust cleaning for Houston restaurants, but the public route is still phone-only with no visible inbox.
                """);

        VendorProspectImportResultView importResult = vendorProspectSourcingService.importCandidates(importForm);
        assertThat(importResult.processedCount()).isEqualTo(3);
        assertThat(vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(VendorProspect::getDisplayName)
                .collect(Collectors.toSet()))
                .contains("Super Hood Cleaning", "Elite Hood Cleaning Service", "Houston Hood Cleaning");

        VendorProspectEnrichmentForm enrichmentForm = new VendorProspectEnrichmentForm();
        enrichmentForm.setEnrichmentRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-enrichment-batch-004.tsv"
        )));

        VendorProspectEnrichmentResultView result = vendorProspectEnrichmentService.enrichCandidates(enrichmentForm);

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.updatedCount()).isEqualTo(3);
        assertThat(result.rejectedCount()).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.decision()).isEqualTo("promoted");
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
        });

        Map<String, VendorProspect> prospectsByName = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> "Super Hood Cleaning".equals(prospect.getDisplayName())
                        || "Elite Hood Cleaning Service".equals(prospect.getDisplayName())
                        || "Houston Hood Cleaning".equals(prospect.getDisplayName()))
                .collect(Collectors.toMap(VendorProspect::getDisplayName, prospect -> prospect, (left, right) -> left));

        assertThat(prospectsByName).containsKeys("Super Hood Cleaning", "Elite Hood Cleaning Service", "Houston Hood Cleaning");
        assertThat(prospectsByName.get("Super Hood Cleaning").getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(prospectsByName.get("Super Hood Cleaning").getEmail()).isEqualTo("info@superhoodcleaning.com");
        assertThat(prospectsByName.get("Elite Hood Cleaning Service").getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(prospectsByName.get("Elite Hood Cleaning Service").getEmail()).isEqualTo("team@elitehoodservice.com");
        assertThat(prospectsByName.get("Houston Hood Cleaning").getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(prospectsByName.get("Houston Hood Cleaning").getEmail()).isEqualTo("info@houstonhoodcleaning.com");
    }

    @Test
    @Transactional
    void usExpansionEnrichmentBatch005PromotesFloridaRrSafeKexAndTd() throws Exception {
        VendorProspectImportForm importForm = new VendorProspectImportForm();
        importForm.setCandidateRows("""
                Florida Hood Cleaning|https://flhoodcleaning.com/|https://flhoodcleaning.com/|Miami|Miami, Fort Lauderdale, West Palm Beach, Orlando, and broader Central and South Florida commercial kitchens|||786-394-3186|Small owner-operated Florida hood cleaning company with commercial kitchen hood cleaning, kitchen exhaust cleaning, NFPA 96 language, before-and-after photo support, and explicit Central and South Florida restaurant coverage. No public email is exposed, so hold in research queue.
                R & R Hood Cleaning Specialists|https://r-rhoods.com/|https://r-rhoods.com/|Portland|Portland metro and broader Oregon commercial kitchens|||503-569-4551|Oregon hood-cleaning specialist that describes itself as family owned and operated, personally managing every job with the same trusted team, and focused on professional commercial hood cleaning on the official site. No verified public inbox was accessible.
                SafeKex L.L.C.|https://safekexllc.com/|https://safekexllc.com/about-us|Washington DC|Maryland, Washington DC, and Northern Virginia commercial kitchens|||240-813-3126|Veteran-owned and operated Mid-Atlantic hood-cleaning operator whose official about page says it specializes in kitchen hood cleaning services, is rooted in NFPA 96 fire-safety compliance, serves Maryland and Washington DC with Northern Virginia coming soon, and currently exposes no verified public business inbox.
                TD Hood Cleaning Service LLC|https://tdhoodcleaning.com/|https://tdhoodcleaning.com/|Natchitoches|Natchitoches, Provencal, Vienna Bend, Campti, Coushatta, Many, Martin, Montgomery, Point Place, and nearby Louisiana commercial kitchens|||318-290-2537|Very local Louisiana operator whose official site says it provides thorough, code-compliant hood cleaning solutions for restaurants in Natchitoches and nearby towns, but no public business email is visibly published on the official pages.
                """);

        VendorProspectImportResultView importResult = vendorProspectSourcingService.importCandidates(importForm);
        assertThat(importResult.processedCount()).isEqualTo(4);
        assertThat(vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(VendorProspect::getDisplayName)
                .collect(Collectors.toSet()))
                .contains("Florida Hood Cleaning", "R & R Hood Cleaning Specialists", "SafeKex L.L.C.", "TD Hood Cleaning Service LLC");

        VendorProspectEnrichmentForm enrichmentForm = new VendorProspectEnrichmentForm();
        enrichmentForm.setEnrichmentRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-enrichment-batch-005.tsv"
        )));

        VendorProspectEnrichmentResultView result = vendorProspectEnrichmentService.enrichCandidates(enrichmentForm);

        assertThat(result.processedCount()).isEqualTo(4);
        assertThat(result.updatedCount()).isEqualTo(4);
        assertThat(result.rejectedCount()).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.decision()).isEqualTo("promoted");
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
        });

        Map<String, VendorProspect> prospectsByName = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> "Florida Hood Cleaning".equals(prospect.getDisplayName())
                        || "R & R Hood Cleaning Specialists".equals(prospect.getDisplayName())
                        || "SafeKex L.L.C.".equals(prospect.getDisplayName())
                        || "TD Hood Cleaning Service LLC".equals(prospect.getDisplayName()))
                .collect(Collectors.toMap(VendorProspect::getDisplayName, prospect -> prospect, (left, right) -> left));

        assertThat(prospectsByName).containsKeys("Florida Hood Cleaning", "R & R Hood Cleaning Specialists", "SafeKex L.L.C.", "TD Hood Cleaning Service LLC");
        assertThat(prospectsByName.get("Florida Hood Cleaning").getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(prospectsByName.get("Florida Hood Cleaning").getEmail()).isEqualTo("info@flhoodcleaning.com");
        assertThat(prospectsByName.get("R & R Hood Cleaning Specialists").getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(prospectsByName.get("R & R Hood Cleaning Specialists").getEmail()).isEqualTo("rrhoodcleaning@gmail.com");
        assertThat(prospectsByName.get("SafeKex L.L.C.").getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(prospectsByName.get("SafeKex L.L.C.").getEmail()).isEqualTo("Service_Request@safekexllc.com");
        assertThat(prospectsByName.get("TD Hood Cleaning Service LLC").getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(prospectsByName.get("TD Hood Cleaning Service LLC").getEmail()).isEqualTo("admin@tdhoodcleaning.com");
    }

    @Test
    void usExpansionSendReadyBatch032PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-032.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(5);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(5);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(5);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch012ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-012.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(2);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(2);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        prospects.forEach(prospect -> assertThat(csv).doesNotContain(prospect.getSourceUrl()));
    }

    @Test
    void usExpansionSendReadyBatch033PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-033.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(7);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(7);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(7);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch013ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-013.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(3);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        prospects.forEach(prospect -> assertThat(csv).doesNotContain(prospect.getSourceUrl()));
    }

    @Test
    void usExpansionSendReadyBatch034PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-034.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(9);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(9);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(9);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch014ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-014.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(2);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(2);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        prospects.forEach(prospect -> assertThat(csv).doesNotContain(prospect.getSourceUrl()));
    }

    @Test
    void usExpansionSendReadyBatch035PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-035.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(8);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(8);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(8);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch015ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-015.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(1);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(1);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        prospects.forEach(prospect -> assertThat(csv).doesNotContain(prospect.getSourceUrl()));
    }

    @Test
    void usExpansionSendReadyBatch036PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-036.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(6);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(6);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(6);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch016ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-016.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(2);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(2);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        prospects.forEach(prospect -> assertThat(csv).doesNotContain(prospect.getSourceUrl()));
    }

    @Test
    void usExpansionSendReadyBatch037PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-037.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(2);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(2);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isNotBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch017ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-017.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(3);
        assertThat(prospects)
                .allSatisfy(prospect -> {
                    assertThat(prospect.getEmail()).isBlank();
                    assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
                    assertThat(prospect.getSourceUrl()).isNotBlank();
                    assertThat(prospect.getVendorFitScore()).isGreaterThanOrEqualTo(55);
                    assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(45);
                    assertThat(prospect.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
                    assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
                });

        String csv = new String(outboundOpsService.exportProspectsCsv());
        prospects.forEach(prospect -> assertThat(csv).doesNotContain(prospect.getSourceUrl()));
    }

    @Test
    void usExpansionSendReadyBatch038PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-038.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(5);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(5);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(5);
        assertThat(prospects).allSatisfy(prospect -> {
            assertThat(prospect.getEmail()).isNotBlank();
            assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
            assertThat(prospect.getSourceUrl()).isNotBlank();
            assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch018ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-018.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(2);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionSendReadyBatch039PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-039.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(8);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(8);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });

        Set<String> batchNames = result.rows().stream()
                .map(row -> row.displayName())
                .collect(Collectors.toSet());
        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> batchNames.contains(prospect.getDisplayName()))
                .toList();
        assertThat(prospects).hasSize(8);
        assertThat(prospects).allSatisfy(prospect -> {
            assertThat(prospect.getEmail()).isNotBlank();
            assertThat(prospect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
            assertThat(prospect.getSourceUrl()).isNotBlank();
            assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch019ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-019.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionSendReadyBatch040PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-040.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionSendReadyBatch041PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-041.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionSendReadyBatch042PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-042.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionSendReadyBatch043PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-043.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionSendReadyBatch044PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-044.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionSendReadyBatch045PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-045.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionSendReadyBatch046PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-046.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(2);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionSendReadyBatch047PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-047.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionSendReadyBatch048PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-048.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionSendReadyBatch049PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-049.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(2);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionSendReadyBatch050PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-050.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(2);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionSendReadyBatch051PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-051.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(5);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(5);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionSendReadyBatch052PassesSourcingEngine() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-send-ready-batch-052.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(2);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch020ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-020.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(4);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(4);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch024ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-024.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(4);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(4);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch025ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-025.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(6);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(6);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch026ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-026.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(5);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(5);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch027ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-027.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(1);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch022ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-022.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(2);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch023ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-023.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(3);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(3);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void usExpansionNeedsEnrichmentBatch021ImportsAsResearchOnly() throws Exception {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "us-expansion-needs-enrichment-batch-021.tsv"
        )));

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);
        String rejectedRows = result.rows().stream()
                .filter(row -> !row.imported())
                .map(row -> row.displayName() + ": " + row.reason())
                .collect(Collectors.joining("\n"));

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.importedCount()).as(rejectedRows).isEqualTo(1);
        assertThat(result.rejectedCount()).as(rejectedRows).isZero();
        assertThat(result.rows()).allSatisfy(row -> {
            assertThat(row.imported()).isTrue();
            assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
            assertThat(row.sendPriority()).isEqualTo("RESEARCH");
            assertThat(row.primaryOfferAxis()).isEqualTo("AXIS_1");
        });
    }

    @Test
    void explicitExpansionMarketsImportAsAxis1Only() {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows("""
                Phoenix Hood Route|https://phoenixhoodroute.example|https://phoenixhoodroute.example/commercial-kitchen-exhaust|Phoenix|Phoenix, Mesa, Tempe, and Scottsdale restaurants|Riley Owner|riley@phoenixhoodroute.example|602-555-0100|Owner operated commercial kitchen exhaust cleaning and vent hood cleaning provider. NFPA 96 service, restaurant hood cleaning, surrounding areas, request quote.
                """);

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.importedCount()).isEqualTo(1);
        assertThat(result.rejectedCount()).isZero();

        VendorProspect phoenix = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> "Phoenix Hood Route".equals(prospect.getDisplayName()))
                .findFirst()
                .orElseThrow();
        assertThat(phoenix.getPrimaryMetro()).isEqualTo("Phoenix");
        assertThat(phoenix.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
        assertThat(phoenix.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
        assertThat(phoenix.getNotes()).contains("not active Axis 2 coverage");
    }

    @Test
    void vendorNamesContainingAustinDoNotCreateFalseAxis2Overlap() {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows("""
                Northland Austin Kitchen Exhaust Pros|https://northlandaustin.example|https://northlandaustin.example/contact|Lansing|Lansing, Grand Rapids, and Saginaw commercial kitchens|Dana Owner|dana@northlandaustin.example|989-555-0100|Michigan operator with hood cleaning, kitchen exhaust cleaning, NFPA 96 service, and explicit Lansing, Grand Rapids, and Saginaw commercial kitchen coverage.
                """);

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.importedCount()).isEqualTo(1);
        assertThat(result.rejectedCount()).isZero();

        VendorProspect michigan = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> "Northland Austin Kitchen Exhaust Pros".equals(prospect.getDisplayName()))
                .findFirst()
                .orElseThrow();
        assertThat(michigan.getPrimaryMetro()).isEqualTo("Lansing");
        assertThat(michigan.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
        assertThat(michigan.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
    }

    @Test
    void strongLocalFitWithoutEmailImportsAsResearchAndStaysOutOfExport() {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows("""
                Research Queue Hood Route|https://researchhood.example|https://researchhood.example/contact|Tulsa|Tulsa, Broken Arrow, and nearby Oklahoma commercial kitchens|Jamie Owner||918-555-0100|Owner operated hood cleaning, kitchen exhaust cleaning, NFPA 96 service, locally owned, quote, and explicit Tulsa commercial kitchen coverage.
                Send Ready Hood Route|https://sendreadyhood.example|https://sendreadyhood.example/contact|Tulsa|Tulsa and nearby Oklahoma commercial kitchens|Jamie Owner|jamie@sendreadyhood.example|918-555-0101|Owner operated hood cleaning, kitchen exhaust cleaning, NFPA 96 service, locally owned, quote, and explicit Tulsa commercial kitchen coverage.
                """);

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).isEqualTo(2);
        assertThat(result.rejectedCount()).isZero();
        assertThat(result.rows())
                .anySatisfy(row -> {
                    assertThat(row.displayName()).isEqualTo("Research Queue Hood Route");
                    assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
                    assertThat(row.sendPriority()).isEqualTo("RESEARCH");
                })
                .anySatisfy(row -> {
                    assertThat(row.displayName()).isEqualTo("Send Ready Hood Route");
                    assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
                    assertThat(row.sendPriority()).isIn("P1", "P2", "P3");
                });

        VendorProspect research = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> "Research Queue Hood Route".equals(prospect.getDisplayName()))
                .findFirst()
                .orElseThrow();
        assertThat(research.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
        assertThat(research.getVendorFitScore()).isGreaterThanOrEqualTo(65);
        assertThat(research.getLegitimacyScore()).isGreaterThanOrEqualTo(55);
        assertThat(research.getNotes()).contains("research queue");

        String csv = new String(outboundOpsService.exportProspectsCsv());
        assertThat(csv).contains("Send Ready Hood Route");
        assertThat(csv).doesNotContain("Research Queue Hood Route");
    }

    @Test
    void googleMapsDiscoveryWithoutWebsiteStillImportsAsResearch() {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows("""
                Maps First Hood Cleaning||https://www.google.com/maps/place/Maps+First+Hood+Cleaning|Jacksonville|Jacksonville, Orange Park, and nearby Florida commercial kitchens|Maya Owner||904-555-0110|Google Business Profile with 32 reviews, recent job photos, owner operated hood cleaning, kitchen exhaust cleaning, NFPA 96 service, locally owned, and call now for quote.
                """);

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.importedCount()).isEqualTo(1);
        assertThat(result.rejectedCount()).isZero();
        assertThat(result.rows().get(0).prospectStatus()).isEqualTo("RESEARCH");

        VendorProspect mapsProspect = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> "Maps First Hood Cleaning".equals(prospect.getDisplayName()))
                .findFirst()
                .orElseThrow();
        assertThat(mapsProspect.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
        assertThat(mapsProspect.getSourceChannel()).isEqualTo("GOOGLE_MAPS");
        assertThat(mapsProspect.getVendorFitScore()).isGreaterThanOrEqualTo(70);
        assertThat(mapsProspect.getLegitimacyScore()).isGreaterThanOrEqualTo(70);
        assertThat(mapsProspect.getNotes()).contains("GOOGLE_MAPS");
    }

    @Test
    void socialProfileWithUsableEmailCanImportAsActive() {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows("""
                Neighborhood Hood Crew||https://www.facebook.com/neighborhoodhoodcrew|Greenville|Greenville, Greer, and Simpsonville commercial kitchens|Alex Owner|neighborhoodhoodcrew@gmail.com|864-555-0111|Facebook page with owner replies, 18 recent job photos, owner operated hood cleaning, kitchen exhaust cleaning, NFPA 96 service, locally owned, and message us for quote.
                """);

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.importedCount()).isEqualTo(1);
        assertThat(result.rejectedCount()).isZero();
        assertThat(result.rows().get(0).prospectStatus()).isEqualTo("ACTIVE");

        VendorProspect socialProspect = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> "Neighborhood Hood Crew".equals(prospect.getDisplayName()))
                .findFirst()
                .orElseThrow();
        assertThat(socialProspect.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(socialProspect.getSourceChannel()).isEqualTo("SOCIAL_PROFILE");
        assertThat(socialProspect.getContactConfidence()).isGreaterThanOrEqualTo(70);

        String csv = new String(outboundOpsService.exportProspectsCsv());
        assertThat(csv).contains("Neighborhood Hood Crew");
    }

    @Test
    void approvedGovernmentVendorListGetsHighTrustClassification() {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows("""
                Approved Metro Hood Route|https://approvedmetrohood.example|https://city.example.gov/approved-companies-commercial-cooking|Nashua|Nashua and nearby southern New Hampshire commercial kitchens|Jordan Owner|jordan@approvedmetrohood.example|603-555-0170|Approved hood cleaning vendor list reference with commercial kitchen exhaust cleaning, hood cleaning, NFPA 96, fire marshal compliance, and locally owned service for restaurants in Nashua.
                """);

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.importedCount()).isEqualTo(1);
        assertThat(result.rejectedCount()).isZero();

        VendorProspect prospect = vendorProspectRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(candidate -> candidate.getDisplayName().equals("Approved Metro Hood Route"))
                .findFirst()
                .orElseThrow();

        assertThat(prospect.getSourceChannel()).isEqualTo("APPROVED_VENDOR_LIST");
        assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(80);
        assertThat(prospect.getNotes()).contains("APPROVED_VENDOR_LIST");
    }

    @Test
    void allbizOwnerDirectoryIsTreatedAsBusinessDirectory() {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows("""
                Directory Owner Hood Crew|https://directoryownerhood.example|https://www.allbiz.com/business/directory-owner-hood|Boston|Boston and nearby eastern Massachusetts commercial kitchens|Dana Owner|dana@directoryownerhood.example|617-555-0171|Allbiz profile names Dana Owner as founder and lists direct contact details, while the operator provides commercial kitchen hood cleaning, kitchen exhaust cleaning, Boston fire code help, and NFPA 96 service for restaurants.
                """);

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.importedCount()).isEqualTo(1);
        assertThat(result.rejectedCount()).isZero();

        VendorProspect prospect = vendorProspectRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(candidate -> candidate.getDisplayName().equals("Directory Owner Hood Crew"))
                .findFirst()
                .orElseThrow();

        assertThat(prospect.getSourceChannel()).isEqualTo("BUSINESS_DIRECTORY");
        assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(58);
    }

    @Test
    void ikecaTradeAssociationSourceImprovesTrustForCertifiedLocalOperator() {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows("""
                IKECA Member Hood Crew|https://ikecamemberhood.example|https://www.ikeca.org/search/advanced.asp|Providence|Providence and nearby Rhode Island commercial kitchens|Taylor Owner|taylor@ikecamemberhood.example|401-555-0172|IKECA member directory listing with CECS certified exhaust cleaning specialist, active member, NFPA 96, full commercial kitchen exhaust cleaning, and locally owned restaurant hood cleaning service.
                """);

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.importedCount()).isEqualTo(1);
        assertThat(result.rejectedCount()).isZero();

        VendorProspect prospect = vendorProspectRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(candidate -> candidate.getDisplayName().equals("IKECA Member Hood Crew"))
                .findFirst()
                .orElseThrow();

        assertThat(prospect.getSourceChannel()).isEqualTo("TRADE_ASSOCIATION");
        assertThat(prospect.getLegitimacyScore()).isGreaterThanOrEqualTo(72);
        assertThat(prospect.getNotes()).contains("TRADE_ASSOCIATION");
    }

    @Test
    @Transactional
    void texasMvpEnrichmentBatch001PromotesSixResearchProspects() throws Exception {
        VendorProspectImportForm importForm = new VendorProspectImportForm();
        importForm.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "texas-mvp-needs-enrichment.tsv"
        )));

        VendorProspectImportResultView importResult = vendorProspectSourcingService.importCandidates(importForm);

        assertThat(importResult.processedCount()).isEqualTo(12);
        assertThat(importResult.importedCount()).isEqualTo(12);
        assertThat(importResult.rejectedCount()).isZero();
        assertThat(importResult.rows()).allSatisfy(row -> assertThat(row.prospectStatus()).isEqualTo("RESEARCH"));

        VendorProspectEnrichmentForm enrichmentForm = new VendorProspectEnrichmentForm();
        enrichmentForm.setEnrichmentRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "texas-mvp-enrichment-batch-001.tsv"
        )));

        VendorProspectEnrichmentResultView enrichmentResult = vendorProspectEnrichmentService.enrichCandidates(enrichmentForm);

        assertThat(enrichmentResult.processedCount()).isEqualTo(12);
        assertThat(enrichmentResult.updatedCount()).isEqualTo(12);
        assertThat(enrichmentResult.rejectedCount()).isZero();

        Set<String> promotedNames = Set.of(
                "HydroPlus Kitchen Exhaust Services",
                "WhaleyCo Kitchen and Cleaning Services",
                "Angel's H.C. Vent and Hood",
                "HOODZ of San Antonio",
                "FilterShine CenTex",
                "Fresh Air Restoration and Cleaning"
        );
        Set<String> researchNames = Set.of(
                "Kitchen Guard of Austin",
                "Setpoint Services",
                "Kitchen Guard of Dallas-Fort Worth",
                "Hood Boss",
                "Spectra Cleaning Service LLC",
                "Kitchen Guard of San Antonio"
        );

        Map<String, ProspectStatus> prospectStatuses = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> promotedNames.contains(prospect.getDisplayName()) || researchNames.contains(prospect.getDisplayName()))
                .collect(Collectors.toMap(VendorProspect::getDisplayName, VendorProspect::getProspectStatus, (left, right) -> left));

        assertThat(prospectStatuses.keySet()).containsAll(promotedNames).containsAll(researchNames);
        promotedNames.forEach(name -> assertThat(prospectStatuses).containsEntry(name, ProspectStatus.ACTIVE));
        researchNames.forEach(name -> assertThat(prospectStatuses).containsEntry(name, ProspectStatus.RESEARCH));

        String csv = new String(outboundOpsService.exportProspectsCsv());
        promotedNames.forEach(name -> assertThat(csv).contains(name));
        researchNames.forEach(name -> assertThat(csv).doesNotContain(name));
        assertThat(csv)
                .contains("services@hpkes.com")
                .contains("Whaleyco7@gmail.com")
                .contains("angelshcdfw@yahoo.com")
                .contains("hoodz.eastsa@hoodz.us.com")
                .contains("mdutton@filtershineusa.com")
                .contains("chris@freshairsa.com");
    }

    @Test
    @Transactional
    void texasMvpEnrichmentBatch002PromotesThreeMoreResearchProspects() throws Exception {
        VendorProspectImportForm importForm = new VendorProspectImportForm();
        importForm.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "texas-mvp-needs-enrichment.tsv"
        )));
        vendorProspectSourcingService.importCandidates(importForm);

        VendorProspectEnrichmentForm firstPassForm = new VendorProspectEnrichmentForm();
        firstPassForm.setEnrichmentRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "texas-mvp-enrichment-batch-001.tsv"
        )));
        VendorProspectEnrichmentResultView firstPassResult = vendorProspectEnrichmentService.enrichCandidates(firstPassForm);
        assertThat(firstPassResult.updatedCount()).isEqualTo(12);

        VendorProspectEnrichmentForm secondPassForm = new VendorProspectEnrichmentForm();
        secondPassForm.setEnrichmentRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "texas-mvp-enrichment-batch-002.tsv"
        )));

        VendorProspectEnrichmentResultView secondPassResult = vendorProspectEnrichmentService.enrichCandidates(secondPassForm);

        assertThat(secondPassResult.processedCount()).isEqualTo(3);
        assertThat(secondPassResult.updatedCount()).isEqualTo(3);
        assertThat(secondPassResult.rejectedCount()).isZero();
        assertThat(secondPassResult.rows())
                .allSatisfy(row -> {
                    assertThat(row.decision()).isEqualTo("promoted");
                    assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
                });

        Set<String> activeNames = Set.of(
                "HydroPlus Kitchen Exhaust Services",
                "WhaleyCo Kitchen and Cleaning Services",
                "Angel's H.C. Vent and Hood",
                "HOODZ of San Antonio",
                "FilterShine CenTex",
                "Fresh Air Restoration and Cleaning",
                "Kitchen Guard of Dallas-Fort Worth",
                "Hood Boss",
                "Kitchen Guard of San Antonio"
        );
        Set<String> researchNames = Set.of(
                "Kitchen Guard of Austin",
                "Setpoint Services",
                "Spectra Cleaning Service LLC"
        );

        Map<String, ProspectStatus> prospectStatuses = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> activeNames.contains(prospect.getDisplayName()) || researchNames.contains(prospect.getDisplayName()))
                .collect(Collectors.toMap(VendorProspect::getDisplayName, VendorProspect::getProspectStatus, (left, right) -> left));

        assertThat(prospectStatuses.keySet()).containsAll(activeNames).containsAll(researchNames);
        activeNames.forEach(name -> assertThat(prospectStatuses).containsEntry(name, ProspectStatus.ACTIVE));
        researchNames.forEach(name -> assertThat(prospectStatuses).containsEntry(name, ProspectStatus.RESEARCH));

        String csv = new String(outboundOpsService.exportProspectsCsv());
        activeNames.forEach(name -> assertThat(csv).contains(name));
        researchNames.forEach(name -> assertThat(csv).doesNotContain(name));
        assertThat(csv)
                .contains("teran.moore@kitchenguard.com")
                .contains("jeff@thehoodboss.com")
                .contains("sjohnson@kitchenguard.com");
    }

    @Test
    @Transactional
    void texasMvpEnrichmentBatch003PromotesKitchenGuardAustinAndLeavesTwoResearchProspects() throws Exception {
        VendorProspectImportForm importForm = new VendorProspectImportForm();
        importForm.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "texas-mvp-needs-enrichment.tsv"
        )));
        vendorProspectSourcingService.importCandidates(importForm);

        VendorProspectEnrichmentForm firstPassForm = new VendorProspectEnrichmentForm();
        firstPassForm.setEnrichmentRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "texas-mvp-enrichment-batch-001.tsv"
        )));
        vendorProspectEnrichmentService.enrichCandidates(firstPassForm);

        VendorProspectEnrichmentForm secondPassForm = new VendorProspectEnrichmentForm();
        secondPassForm.setEnrichmentRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "texas-mvp-enrichment-batch-002.tsv"
        )));
        vendorProspectEnrichmentService.enrichCandidates(secondPassForm);

        VendorProspectEnrichmentForm thirdPassForm = new VendorProspectEnrichmentForm();
        thirdPassForm.setEnrichmentRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "texas-mvp-enrichment-batch-003.tsv"
        )));

        VendorProspectEnrichmentResultView thirdPassResult = vendorProspectEnrichmentService.enrichCandidates(thirdPassForm);

        assertThat(thirdPassResult.processedCount()).isEqualTo(1);
        assertThat(thirdPassResult.updatedCount()).isEqualTo(1);
        assertThat(thirdPassResult.rejectedCount()).isZero();
        assertThat(thirdPassResult.rows())
                .singleElement()
                .satisfies(row -> {
                    assertThat(row.decision()).isEqualTo("promoted");
                    assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
                });

        Set<String> activeNames = Set.of(
                "HydroPlus Kitchen Exhaust Services",
                "WhaleyCo Kitchen and Cleaning Services",
                "Angel's H.C. Vent and Hood",
                "HOODZ of San Antonio",
                "FilterShine CenTex",
                "Fresh Air Restoration and Cleaning",
                "Kitchen Guard of Dallas-Fort Worth",
                "Hood Boss",
                "Kitchen Guard of San Antonio",
                "Kitchen Guard of Austin"
        );
        Set<String> researchNames = Set.of(
                "Setpoint Services",
                "Spectra Cleaning Service LLC"
        );

        Map<String, ProspectStatus> prospectStatuses = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> activeNames.contains(prospect.getDisplayName()) || researchNames.contains(prospect.getDisplayName()))
                .collect(Collectors.toMap(VendorProspect::getDisplayName, VendorProspect::getProspectStatus, (left, right) -> left));

        assertThat(prospectStatuses.keySet()).containsAll(activeNames).containsAll(researchNames);
        activeNames.forEach(name -> assertThat(prospectStatuses).containsEntry(name, ProspectStatus.ACTIVE));
        researchNames.forEach(name -> assertThat(prospectStatuses).containsEntry(name, ProspectStatus.RESEARCH));

        String csv = new String(outboundOpsService.exportProspectsCsv());
        activeNames.forEach(name -> assertThat(csv).contains(name));
        researchNames.forEach(name -> assertThat(csv).doesNotContain(name));
        assertThat(csv).contains("admin.austin@kitchenguard.com");
    }

    @Test
    @Transactional
    void texasMvpEnrichmentBatch004StrengthensRemainingResearchProspectsWithoutPromotingThem() throws Exception {
        VendorProspectImportForm importForm = new VendorProspectImportForm();
        importForm.setCandidateRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "texas-mvp-needs-enrichment.tsv"
        )));
        vendorProspectSourcingService.importCandidates(importForm);

        VendorProspectEnrichmentForm firstPassForm = new VendorProspectEnrichmentForm();
        firstPassForm.setEnrichmentRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "texas-mvp-enrichment-batch-001.tsv"
        )));
        vendorProspectEnrichmentService.enrichCandidates(firstPassForm);

        VendorProspectEnrichmentForm secondPassForm = new VendorProspectEnrichmentForm();
        secondPassForm.setEnrichmentRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "texas-mvp-enrichment-batch-002.tsv"
        )));
        vendorProspectEnrichmentService.enrichCandidates(secondPassForm);

        VendorProspectEnrichmentForm thirdPassForm = new VendorProspectEnrichmentForm();
        thirdPassForm.setEnrichmentRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "texas-mvp-enrichment-batch-003.tsv"
        )));
        vendorProspectEnrichmentService.enrichCandidates(thirdPassForm);

        VendorProspectEnrichmentForm fourthPassForm = new VendorProspectEnrichmentForm();
        fourthPassForm.setEnrichmentRows(Files.readString(Path.of(
                "references",
                "vendor-prospects",
                "texas-mvp-enrichment-batch-004.tsv"
        )));

        VendorProspectEnrichmentResultView fourthPassResult = vendorProspectEnrichmentService.enrichCandidates(fourthPassForm);

        assertThat(fourthPassResult.processedCount()).isEqualTo(2);
        assertThat(fourthPassResult.updatedCount()).isEqualTo(2);
        assertThat(fourthPassResult.rejectedCount()).isZero();
        assertThat(fourthPassResult.rows())
                .allSatisfy(row -> {
                    assertThat(row.decision()).isEqualTo("updated");
                    assertThat(row.prospectStatus()).isEqualTo("RESEARCH");
                });

        Map<String, VendorProspect> prospectsByName = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> "Setpoint Services".equals(prospect.getDisplayName()) || "Spectra Cleaning Service LLC".equals(prospect.getDisplayName()))
                .collect(Collectors.toMap(VendorProspect::getDisplayName, prospect -> prospect, (left, right) -> left));

        assertThat(prospectsByName)
                .containsKeys("Setpoint Services", "Spectra Cleaning Service LLC");

        VendorProspect setpoint = prospectsByName.get("Setpoint Services");
        assertThat(setpoint.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
        assertThat(setpoint.getContactSourceUrl()).isEqualTo("https://setpoint.services/contacts/");
        assertThat(setpoint.getPhone()).isEqualTo("512-992-5537");
        assertThat(setpoint.getNotes()).contains("Research enrichment pass");

        VendorProspect spectra = prospectsByName.get("Spectra Cleaning Service LLC");
        assertThat(spectra.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);
        assertThat(spectra.getContactName()).isEqualTo("Charlie Ewalt");
        assertThat(spectra.getRoleTitle()).isEqualTo("Owner/Manager");
        assertThat(spectra.getContactSourceUrl()).isEqualTo("https://www.bbb.org/us/tx/dallas/profile/pressure-washing/spectra-cleaning-llc-0875-90011504");
        assertThat(spectra.getPhone()).isEqualTo("682-224-9786");

        String csv = new String(outboundOpsService.exportProspectsCsv());
        assertThat(csv).doesNotContain("Setpoint Services");
        assertThat(csv).doesNotContain("Spectra Cleaning Service LLC");
    }

    @Test
    void researchQueueProspectCanBePromotedByEnrichmentPass() {
        VendorProspectImportForm importForm = new VendorProspectImportForm();
        importForm.setCandidateRows("""
                Promotable Research Hood Route|https://promotableresearchhood.example|https://www.google.com/maps/place/Promotable+Research+Hood+Route|Tulsa|Tulsa, Broken Arrow, and nearby Oklahoma commercial kitchens|Jamie Owner||918-555-0100|Google Business Profile with owner operated hood cleaning, kitchen exhaust cleaning, NFPA 96 service, locally owned, quote, and recent job photos.
                """);
        vendorProspectSourcingService.importCandidates(importForm);
        VendorProspect queued = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> "Promotable Research Hood Route".equals(prospect.getDisplayName()))
                .findFirst()
                .orElseThrow();
        int queuedFitScore = queued.getProspectFitScore();
        int queuedReadinessScore = queued.getExportReadinessScore();
        assertThat(queued.getProspectStatus()).isEqualTo(ProspectStatus.RESEARCH);

        VendorProspectEnrichmentForm enrichmentForm = new VendorProspectEnrichmentForm();
        enrichmentForm.setEnrichmentRows("""
                Promotable Research Hood Route||https://promotableresearchhood.example/contact|Jamie Owner|Owner|jamie@promotableresearchhood.example|918-555-0100|Official contact page now shows owner email, quote form, and direct restaurant hood cleaning service coverage.
                """);

        VendorProspectEnrichmentResultView result = vendorProspectEnrichmentService.enrichCandidates(enrichmentForm);

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.updatedCount()).isEqualTo(1);
        assertThat(result.rejectedCount()).isZero();
        assertThat(result.rows())
                .singleElement()
                .satisfies(row -> {
                    assertThat(row.decision()).isEqualTo("promoted");
                    assertThat(row.prospectStatus()).isEqualTo("ACTIVE");
                });

        VendorProspect promoted = vendorProspectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(prospect -> "Promotable Research Hood Route".equals(prospect.getDisplayName()))
                .findFirst()
                .orElseThrow();
        assertThat(promoted.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(promoted.getEmail()).isEqualTo("jamie@promotableresearchhood.example");
        assertThat(promoted.getSourceChannel()).isEqualTo("OFFICIAL_SITE");
        assertThat(promoted.getSendPriority()).isIn("P1", "P2", "P3");
        assertThat(promoted.getProspectFitScore()).isEqualTo(queuedFitScore);
        assertThat(promoted.getExportReadinessScore()).isGreaterThan(queuedReadinessScore);
        assertThat(promoted.getNotes()).contains("Research enrichment pass");

        String csv = new String(outboundOpsService.exportProspectsCsv());
        assertThat(csv).contains("Promotable Research Hood Route");
        assertThat(csv).contains("jamie@promotableresearchhood.example");
    }

    @Test
    void enrichmentEndpointPromotesResearchQueueProspect() throws Exception {
        VendorProspectImportForm importForm = new VendorProspectImportForm();
        importForm.setCandidateRows("""
                Endpoint Research Hood|https://endpointhood.example|https://www.google.com/maps/place/Endpoint+Research+Hood|Greenville|Greenville and nearby South Carolina commercial kitchens|Avery Owner||864-555-0222|Google Business Profile with owner operated hood cleaning, kitchen exhaust cleaning, NFPA 96 service, locally owned, and recent job photos.
                """);
        vendorProspectSourcingService.importCandidates(importForm);

        mockMvc.perform(post("/ops/outbound/prospects/enrichment")
                        .param("enrichmentRows", """
                                Endpoint Research Hood||https://endpointhood.example/contact|Avery Owner|Owner|avery@endpointhood.example|864-555-0222|Official contact page with direct owner email and quote request for restaurant hood cleaning.
                                """))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Run enrichment pass")))
                .andExpect(content().string(containsString("Updated 1")))
                .andExpect(content().string(containsString("promoted")))
                .andExpect(content().string(containsString("Endpoint Research Hood")));
    }

    @Test
    void bulkImportQualifiesHoodVendorsAndRejectsGenericCleaners() throws Exception {
        String rows = """
                Austin Hood Operators|https://austinhooodops.example|https://austinhooodops.example/hood-cleaning|Austin|Austin, Round Rock, and Cedar Park restaurants|Jamie Owner|jamie@austinhooodops.example|512-555-0100|Owner operated commercial kitchen exhaust and hood cleaning provider. NFPA 96 service, restaurant hood cleaning, surrounding areas, request quote.
                San Antonio Hood Route|https://satxhoodroute.example|https://satxhoodroute.example/commercial-kitchen-exhaust|San Antonio|San Antonio and New Braunfels restaurants|Avery Soto|info@satxhoodroute.example|210-555-0100|Commercial kitchen exhaust cleaning, vent hood cleaning, NFPA 96 compliance, family owned, quote request.
                Sparkle Office Cleaning|https://sparkleoffice.example|https://sparkleoffice.example/services|DFW|Dallas offices and retail|Morgan Desk|hello@sparkleoffice.example|214-555-0100|Janitorial office cleaning, restroom sanitation, window washing, and floor care.
                """;

        mockMvc.perform(post("/ops/outbound/prospects/import")
                        .param("candidateRows", rows))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Processed 3")))
                .andExpect(content().string(containsString("Imported 2")))
                .andExpect(content().string(containsString("Rejected 1")))
                .andExpect(content().string(containsString("Austin active overlap")))
                .andExpect(content().string(containsString("San Antonio is prospectable, but not active Axis 2 coverage")))
                .andExpect(content().string(containsString("Weak hood-service evidence")));

        List<VendorProspect> prospects = vendorProspectRepository.findAllByOrderByCreatedAtDesc();

        VendorProspect austin = prospects.stream()
                .filter(prospect -> "Austin Hood Operators".equals(prospect.getDisplayName()))
                .findFirst()
                .orElseThrow();
        assertThat(austin.getPrimaryMetro()).isEqualTo("Austin");
        assertThat(austin.getServiceAreaOverlapStatus()).isEqualTo("ACTIVE_AXIS2_OVERLAP");
        assertThat(austin.getPrimaryOfferAxis()).isEqualTo("AXIS_2");
        assertThat(austin.getSegmentationLabel()).isEqualTo("growth_oriented");
        assertThat(austin.getAxis2AngleFit()).isGreaterThanOrEqualTo(austin.getAxis1AngleFit());

        VendorProspect sanAntonio = prospects.stream()
                .filter(prospect -> "San Antonio Hood Route".equals(prospect.getDisplayName()))
                .findFirst()
                .orElseThrow();
        assertThat(sanAntonio.getPrimaryMetro()).isEqualTo("San Antonio");
        assertThat(sanAntonio.getServiceAreaOverlapStatus()).isEqualTo("NO_ACTIVE_AXIS2_OVERLAP");
        assertThat(sanAntonio.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
        assertThat(sanAntonio.getNotes()).contains("not active Axis 2 coverage");

        assertThat(prospects)
                .noneMatch(prospect -> "Sparkle Office Cleaning".equals(prospect.getDisplayName()));
    }

    @Test
    void ownerLedRestaurantFocusedVendorOutranksMixedFacilityOperator() {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows("""
                Owner-Led Hood Crew|https://ownerledhood.example|https://ownerledhood.example/contact|DFW|Dallas, Plano, Irving, and nearby restaurant kitchens|Jamie Owner|jamie@ownerledhood.example|214-555-0100|Owner operated family owned commercial kitchen hood cleaning company for restaurant operators with kitchen exhaust cleaning, before and after photos, service stickers, free estimate, and repeat service support.
                Mixed Facility Hood Group|https://mixedfacilityhood.example|https://mixedfacilityhood.example/contact|DFW|Dallas, schools, hospitals, and north Texas commercial kitchens|Office Team|contact@mixedfacilityhood.example|972-555-0100|Regional commercial kitchen hood cleaning provider with janitorial, air duct HVAC cleaning, floor care, pressure washing, fire suppression, schools, hospitals, property management, customer portal, dashboard, and account managers.
                """);

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).isEqualTo(1);
        assertThat(result.rejectedCount()).isEqualTo(1);
        assertThat(result.rows()).anySatisfy(row -> {
            assertThat(row.displayName()).isEqualTo("Mixed Facility Hood Group");
            assertThat(row.imported()).isFalse();
            assertThat(row.reason()).contains("not a strong match");
        });

        VendorProspect strongFit = vendorProspectRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(prospect -> prospect.getDisplayName().equals("Owner-Led Hood Crew"))
                .findFirst()
                .orElseThrow();

        assertThat(strongFit.getSendPriority()).isIn("P1", "P2");
        assertThat(strongFit.getOwnershipStyle()).isEqualTo(OwnershipStyle.OWNER_LED);
        assertThat(strongFit.getVendorQualityTier()).isEqualTo("A");
        assertThat(strongFit.getProspectFitScore()).isGreaterThanOrEqualTo(80);
        assertThat(strongFit.getExportReadinessScore()).isGreaterThanOrEqualTo(70);
    }

    @Test
    void adjacentMixedRestaurantOperatorStillImportsAsUsableCandidate() {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows("""
                Pure-Play Hood Crew|https://pureplayhood.example|https://pureplayhood.example/contact|DFW|Dallas, Irving, Plano, and nearby restaurant kitchens|Jamie Owner|jamie@pureplayhood.example|214-555-0100|Owner operated family owned commercial kitchen hood cleaning company for restaurant operators with kitchen exhaust cleaning, NFPA 96 service, before and after photos, free estimate, and repeat service support.
                Local Hood Fire Route|https://localhoodfire.example|https://localhoodfire.example/contact|DFW|Dallas, Irving, and nearby restaurant kitchens|Taylor Owner|taylor@localhoodfire.example|214-555-0110|Locally owned commercial kitchen hood cleaning operator for restaurant owners with kitchen exhaust cleaning, NFPA 96 service, hood repair, fire suppression coordination, fire extinguisher support, restaurant equipment cleaning, and free quote service.
                """);

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).isEqualTo(2);
        assertThat(result.rejectedCount()).isZero();

        VendorProspect purePlay = vendorProspectRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(prospect -> prospect.getDisplayName().equals("Pure-Play Hood Crew"))
                .findFirst()
                .orElseThrow();
        VendorProspect adjacentMixed = vendorProspectRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(prospect -> prospect.getDisplayName().equals("Local Hood Fire Route"))
                .findFirst()
                .orElseThrow();

        assertThat(purePlay.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(purePlay.getVendorQualityTier()).isEqualTo("A");
        assertThat(adjacentMixed.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(adjacentMixed.getVendorQualityTier()).isEqualTo("B");
        assertThat(adjacentMixed.getProspectFitScore()).isGreaterThanOrEqualTo(70);
        assertThat(adjacentMixed.getExportReadinessScore()).isGreaterThanOrEqualTo(60);
        assertThat(adjacentMixed.getNotes()).contains("Axis 1");
    }

    @Test
    void hoodFirstMixedBVendorImportsWhileBroadMixedOperatorIsRejected() {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows("""
                Local Hood Fire Route B|https://localhoodfireb.example|https://localhoodfireb.example/contact|DFW|Dallas, Irving, and nearby restaurant kitchens|Taylor Owner|taylor@localhoodfireb.example|214-555-0110|Locally owned commercial kitchen hood cleaning operator for restaurant owners with kitchen exhaust cleaning, NFPA 96 service, hood repair, fire suppression coordination, fire extinguisher support, restaurant equipment cleaning, and free quote service.
                Broad Facility Route|https://broadfacilityroute.example|https://broadfacilityroute.example/contact|DFW|Dallas, schools, hospitals, offices, and nearby commercial kitchens|Office Team|contact@broadfacilityroute.example|214-555-0199|Regional commercial kitchen cleaning vendor with janitorial, carpet cleaning, window cleaning, air duct HVAC cleaning, floor care, property management support, pressure washing, plumbing, pest control, fire suppression, schools, hospitals, customer portal, dashboard, and account managers.
                """);

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);

        assertThat(result.processedCount()).isEqualTo(2);
        assertThat(result.importedCount()).isEqualTo(1);
        assertThat(result.rejectedCount()).isEqualTo(1);
        assertThat(result.rows().stream()
                .filter(row -> row.displayName().equals("Broad Facility Route"))
                .findFirst())
                .hasValueSatisfying(row -> {
                    assertThat(row.imported()).isFalse();
                    assertThat(row.reason()).containsAnyOf("not a strong match", "Weak hood-service evidence");
                });

        VendorProspect adjacentMixed = vendorProspectRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(prospect -> prospect.getDisplayName().equals("Local Hood Fire Route B"))
                .findFirst()
                .orElseThrow();

        assertThat(adjacentMixed.getProspectStatus()).isEqualTo(ProspectStatus.ACTIVE);
        assertThat(adjacentMixed.getVendorQualityTier()).isEqualTo("B");
        assertThat(adjacentMixed.getProspectFitScore()).isGreaterThanOrEqualTo(70);
    }

    @Test
    void photoProofHeavyAustinVendorLeansAxis1() {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows("""
                Austin Photo Packet Hoods|https://austinphotopackethoods.example|https://austinphotopackethoods.example/contact|Austin|Austin, Round Rock, Cedar Park, and nearby restaurant kitchens|Jamie Owner|jamie@austinphotopackethoods.example|512-555-0100|Owner operated commercial kitchen hood cleaning provider with before and after photos, photo report, service report, service sticker, blocked access notes, compliance guidance, and repeat service recommendations for restaurant owners.
                """);

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.importedCount()).isEqualTo(1);
        assertThat(result.rejectedCount()).isZero();

        VendorProspect prospect = vendorProspectRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(candidate -> candidate.getDisplayName().equals("Austin Photo Packet Hoods"))
                .findFirst()
                .orElseThrow();

        assertThat(prospect.getPrimaryMetro()).isEqualTo("Austin");
        assertThat(prospect.getDocumentationMaturity()).isEqualTo(DocumentationMaturity.MEDIUM);
        assertThat(prospect.getAxis1AngleFit()).isGreaterThanOrEqualTo(prospect.getAxis2AngleFit());
        assertThat(prospect.getSegmentationLabel()).isEqualTo("stability_oriented");
        assertThat(prospect.getPrimaryOfferAxis()).isEqualTo("AXIS_1");
    }

    @Test
    void ownerOperatedMarketingCopyDoesNotCountAsDirectOwnerRoute() {
        VendorProspectImportForm form = new VendorProspectImportForm();
        form.setCandidateRows("""
                Marketing Copy Hood Route|https://marketingcopyhood.example|https://marketingcopyhood.example/contact|DFW|Dallas, Plano, and nearby restaurant kitchens||contact@marketingcopyhood.example|972-555-0100|Owner operated family owned commercial kitchen hood cleaning company with kitchen exhaust cleaning, restaurant service, and free estimate.
                """);

        VendorProspectImportResultView result = vendorProspectSourcingService.importCandidates(form);

        assertThat(result.processedCount()).isEqualTo(1);
        assertThat(result.importedCount()).isEqualTo(1);
        assertThat(result.rejectedCount()).isZero();

        VendorProspect prospect = vendorProspectRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(candidate -> candidate.getDisplayName().equals("Marketing Copy Hood Route"))
                .findFirst()
                .orElseThrow();

        assertThat(prospect.getOwnerContactStatus()).isEqualTo(OwnerContactStatus.GENERIC);
        assertThat(prospect.getOwnershipStyle()).isEqualTo(OwnershipStyle.SMALL_OFFICE_LED);
    }

    @Test
    void outboundProspectPageShowsEngineAndSmartleadExport() throws Exception {
        mockMvc.perform(get("/ops/outbound/prospects"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Vendor list engine")))
                .andExpect(content().string(containsString("Run enrichment pass")))
                .andExpect(content().string(containsString("Run sourcing engine")))
                .andExpect(content().string(containsString("Export Send-Now CSV")))
                .andExpect(content().string(containsString("Export Active CSV")));
    }
}
