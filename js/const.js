export default function(cacaoApp){
    cacaoApp.constant('ECO_CODES', [
        'IDA',
        'IMP',
        'IGI',
        'ISS',
        'ISO',
        'ISA',
        'ISM',
        'IGC',
    ]);

    cacaoApp.constant('PHAGE_EVIDENCE', [
        'BLAST',
        'TMHMM',
        'Genomic Context',
    ]);

    cacaoApp.constant('QUALIFIERS', [
        'NOT',
        'contributes_to',
        'colocalizes_with',
    ]);

    cacaoApp.constant('WITH_FROM_DB', [
         'UniProtKB',
         'PMID',
         'InterPro',
         'EcoCyc',
         'DictyBase',
         'FB',
         'MGI',
         'SGD',
         'TAIR',
         'WB',
         'Zfin',
    ]);

    cacaoApp.constant('BLAST_DB', [
         'UNIREF50',
         'UNIREF90',
         'UNIREF100',
         'NR',
         'NT',
         'Canonical',
    ]);

    cacaoApp.constant('DRF_URL', 'http://localhost:8000/');
}
