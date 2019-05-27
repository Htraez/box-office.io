var analysisData = [];
var weekday = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
function addAnalysisTable() {
    var call = this.getAttribute('value');
    $(this).addClass('selected').siblings().removeClass('selected');
        $('#ResultAnalysis').find('li').remove();
        console.log(data);
        analysisData[call].forEach(value => {
            const en = Object.entries(value);
            var temp = (parseInt(call)>=7 && parseInt(call)<=8) ? "Week " : "";
            $('#ResultAnalysis').append('<li><strong>'+temp+((parseInt(call)==9) ? weekday[en[0][1]] : en[0][1])+"</strong>&emsp;"+en[1][0]+" : "+en[1][1]+"&emsp13;"+en[2][0]+" : "+en[2][1]+"&emsp13;"+en[3][0]+" : "+en[3][1]+"&emsp13;"+'</li>');
        });
}

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