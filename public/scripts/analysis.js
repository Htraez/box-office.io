var analysisData = [];
var weekday = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
var call;
function addAnalysisTable() {
    call = this.getAttribute('value');
    $(this).addClass('selected').siblings().removeClass('selected');
    $('#SelectBy').text(Object.keys(analysisData[call][0])[0]);
    $('#ChooseAnalysis').find('option').remove();
    analysisData[call].forEach((value,key)=>{
        $("#ChooseAnalysis").append('<option class="form-control-plaintext" value="'+key+'">'+((parseInt(call)==9) ? weekday[value[Object.keys(analysisData[call][0])[0]]] : value[Object.keys(analysisData[call][0])[0]])+'</option>');
    });
    insertAnalysis(analysisData[call][0]);   
        /*$('#ResultAnalysis').find('li').remove();
        console.log(data);
        analysisData[call].forEach(value => {
            const en = Object.entries(value);
            $('#ResultAnalysis').append('<li><strong>'+temp+((parseInt(call)==9) ? weekday[en[0][1]] : en[0][1])+"</strong>&emsp;"+en[1][0]+" : "+en[1][1]+"&emsp13;"+en[2][0]+" : "+en[2][1]+"&emsp13;"+en[3][0]+" : "+en[3][1]+"&emsp13;"+'</li>');
        });*/
}

function insertAnalysis(data){
    $('#AnalyMin').text(data.min);
    $('#AnalyAvg').text(data.avg);
    $('#AnalyMax').text(data.max);
}

$("#ChooseAnalysis").on("change",function(){
    insertAnalysis(analysisData[call][this.value]);  
})

$(document).on("click",".AnalysisOpt", addAnalysisTable);

$(document).on("click","#showAnalyRe", initdata);

function loadAnaData(i) {
    $.get('/analysis/'+i,(data)=>{
        analysisData[i] = data;
        console.log(i);
        return (i == 14) ? iziToast.destroy() : loadAnaData(i+1); 
    });
}

function initdata() {
    iziToast.show({
        position: "topCenter", 
        iconUrl: '/assets/images/load_placeholder.svg',
        title: 'Fetch Data', 
        color: 'green',
        message: 'Please Wait',
        timeout: false,
        overlay: true,
        close: false
    });
    loadAnaData(0);
}