var flagged_card = function (input) {
    return Object.keys(input.flagged).map(function (key) {
        return input.flagged[key] !== null;
    }).some(function(val){
        return val;
    });
};
export default function(cacaoApp) {
    cacaoApp.filter('review_state_to_english', function() {
        return function(input) {
            switch(input){
                case 0:
                    return "External";
                case 1:
                    return "Unreviewed";
                case 2:
                    return "Accepted";
                case 3:
                    return "Rejected";
            }
        };
    });

    cacaoApp.filter('eco_to_text', function() {
        return function(input) {
            switch(input){
                case 'ND' : return 'No Data';
                case 'IDA': return 'Inferred from Direct Assay';
                case 'IMP': return 'Inferred from Mutant Phenotype';
                case 'IGI': return 'Inferred from Genetic Interaction';
                case 'IEA': return 'Inferred from Electronic Assay';
                case 'ISS': return 'Inferred from Sequence Similarity';
                case 'ISO': return 'Inferred from Sequence Orthology';
                case 'ISA': return 'Inferred from Sequence Alignment';
                case 'ISM': return 'Inferred from Sequence Model';
                case 'IGC': return 'Inferred from Genomic Context';
            }
        };
    });

    cacaoApp.filter('qualifier_to_text', function() {
        return function(input) {
            switch(input){
                case 'NOT': return 'NOT';
                case 'contributes_to': return 'Contributes to';
                case 'colocalizes_with': return 'Colocalizes with';
                default: return 'None';
            }
        };
    })

    cacaoApp.filter('header_color', function() {
        return function(input) {
            switch(input){
                case 0:
                    return 'rgba(226, 226, 226, 1)';
                case 1:
                    return 'rgba(249, 243, 65, .32)';
                case 2:
                    return 'rgba(105, 197, 82, 0.18)';
                case 3:
                    return 'rgba(244, 67, 54, 0.38)';
            }
        }
    })

    cacaoApp.filter('header_icon', function() {
        return function(input) {
            switch(input){
                case 1:
                    return "hourglass_full";
                case 2:
                    return "done";
                case 3:
                    return "close";
            }
        };
    });

    cacaoApp.filter('goChartUrl', function() {
        return function(input) {
            if (input) {
                return 'https://www.ebi.ac.uk/QuickGO-Beta/services/chart?ids=' + input;
            } else {
                return '';
            }
        };
    });

    cacaoApp.filter('anyFlagged', function() {
        return function(input) {
            if (input) {
                return flagged_card(input);
            }
        };
    });

    cacaoApp.filter('challenge_flagged', function() {
        return function(input) {
            if (input) {
                var num = 0;
                for (var i in input) {
                    if (flagged_card(input[i]) == false) {
                        ++num;
                    }
                }
                return num;
            }
        };
    });

    cacaoApp.filter('field_to_flagged', function() {
        return function(input) {
            switch(input){
                case 'qualifier': return 'qualifier';
                case 'go_id': return 'go_id';
                case 'db_reference': return 'publication';
                case 'evidence_code': return 'evidence';
                case 'notes': return 'notes';
                default: return false;
            }
        };
    });

    cacaoApp.filter('flags_to_text', function() {
        return function(input) {
            switch(input){
                case 'qualifier': return 'Qualifier';
                case 'go_id': return 'GO Term';
                case 'publication': return 'Publication';
                case 'evidence': return 'Evidence Code';
                case 'notes': return 'Notes';
            }
        };
    });
}
