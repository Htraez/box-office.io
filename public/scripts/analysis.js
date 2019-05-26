var analysisData;
function addAnalysisTable() {
    console.log(this.getAttribute('value'));
    $.get('/analysis/'+this.getAttribute('value'),(data)=>{
        $('#ResultAnalysis').find('li').remove();
        console.log(data);
        //analysisData = data;
        data.forEach(value => {
            //value = value.replace(/,/g,"&emsp13;");
            const en = Object.entries(value);
            $('#ResultAnalysis').append('<li><strong>'+en[0][1]+"</strong>&emsp;"+en[1][0]+" : "+en[1][1]+"&emsp13;"+en[2][0]+" : "+en[2][1]+"&emsp13;"+en[3][0]+" : "+en[3][1]+"&emsp13;"+'</li>');
        });
    });
    /*data.forEach((value, key) => {
        var tableRowappend = "<li class='planTable'>"+value.PlanName+"</li>";
        $("#listPlanTable").append(tableRowappend);
    });*/
}

$(document).on("click",".AnalysisOpt", addAnalysisTable);