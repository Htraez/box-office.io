
var theater;
var branchName;
var schedule_list =[];
var test;

function ScheduleInfo(data) {
    var payload = { table:"schedule" };
    $("#Schedule").find('tr').remove();
    console.log('A');
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            
            $("#Schedule").append('<li value="'+value.ScheduleNo+'">'+value.ScheduleNo+'&emsp;'+value.MovieNo+'&emsp;'+value.TheatreCode+'</li>');
        });
        console.log(data)
    });
    
}
function showbranch(data) {
    var payload = { table:"branch" };
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            
            $("#Branch").append('<li class="clickTableBranch" value="'+value.BranchNo+'">'+value.BranchName+'</li>');
        });
        console.log(data)
    });
    
}
function showTheater(cl,data) {
    var payload = { table:"theatre" };
    $("#theater").find('li').remove()
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            if(cl==value.BranchNo)
            $("#theater").append('<li class="clickTable">'+value.TheatreCode+'</li>');
            
        });
        console.log(data)
    });
    
}

function compare(temp){
    var found = 0;
    schedule_list.forEach((value)=>{
        if( value.TheatreCode == temp.TheatreCode && value.Date == temp.Date && value.Time == temp.Time) found=1;
    })
    return found;
}

function addScheduleTable(){
    if($('#DateStart').val()!="" && theater != undefined){
        var diff = ($('#DateEnd').val()=="") ? 0 : findDiffDate($('#DateStart').val(),$('#DateEnd').val());
        //console.log(diff);
        for(var i = 0; i <= diff ; i++){
            var day = new Date($('#DateStart').val());
            day.setDate(day.getDate()+i);
            var temp = {
                TheatreCode: theater,
                Date: day.toISOString().substring(0, 10),
                Time: $('#datetime24').val(),
                Audio: $('#Audio').val(),
                Dimension: $('#Dimension').val(),
                Subtitle: $('#SubTitle').val()
            }
            
            if(!compare(temp)) schedule_list.push(temp);
            //console.log(temp);
        }      
    }
    updateSchedule_list(schedule_list);
    // schedule_list.push(temp);
    // updateSchedule_list(schedule_list);
}

function findDiffDate(Start,End){
    end = new Date(End)
    start = new Date(Start)
    diffTime = Math.abs(end.getTime() - start.getTime());
    return (start<end) ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : -1; 
}

function deleteSchedule_list(){
        //$(this).addClass('selected').siblings().removeClass('selected')
        //console.log(this.innerHTML);
        //console.log($(this).attr('value'));
        delete schedule_list[$(this).attr('value')];
        updateSchedule_list(schedule_list);
}

function updateSchedule_list(data){
    $("#schedule-list").find("li").remove();
    $("#schedule-list").append('<li>theaterCode &emsp;&emsp;&emsp;&emsp; Date &emsp;&emsp;&emsp; Audio &emsp;&emsp;&emsp; StartTime &emsp;&emsp;&emsp;Subtitle &emsp;Dimension </li>');
    data.forEach((value,key)=>{
        $("#schedule-list").append('<li class="clickSchedule" value='+key+' >'+value.TheatreCode+'&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;'+value.Date+'&emsp;&emsp;'+value.Audio+'&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;'+value.Time+'&emsp;&emsp;&emsp;&emsp;&emsp;'+value.Subtitle+'&emsp;&emsp;&emsp;&emsp;'+value.Dimension+'&emsp;&emsp;&emsp;&emsp;<span class="deleteSchedule" value="'+key+'">X</span></li>');
    })
}

function createAllSchedules(){
    var payload = {
        Movie : {
        MovieName: $('#MovieName').val(),
        Director: $('#Director').val(),
        Casts: $('#Casts').val(),
        Desc: $('#Desc').val(),
        Duration: $('#Duration').val(),
        Rate: $('#Rate').val(),
        Genre: $('#Genre').val(),
        Studio: $('#Studio').val(),
        PosterURL: $('#PosterURL').val()
        },
        schedule : [...schedule_list]
    };
    console.log(payload)
     if(payload.MovieName!='') $.post('/Movies',payload,(res)=>{
         console.log(success);
         $('#movieAndSchduleForm').hide();
         $('.content-view').show();
        
     });
}

function datetime(){
    $('#datetime24').combodate();  
}
function branch(){
    $(this).addClass('selected').siblings().removeClass('selected')
    console.log(this.value);
    branchName = this.value;
    console.log(branchName)
    showTheater(branchName,);

}
function select_theater(){
    $(this).addClass('selected').siblings().removeClass('selected')
    console.log(this.innerHTML);
    theater = this.innerHTML;
    console.log(theater)

}


function callMovieForm(){
    $('#movieAndSchduleForm').show();
    $('.content-view').hide();
}
function ShowMovieForm(){
    $('#ShowMovieAll').show();
    $('.content-view').hide();
}
// function callScheduleForm(){
//     $('#schduleForm').show();
//     $('#movieForm').hide();
//     branch = $('#Branch').val()
//     showTheater();
// }
// function callBackMovieForm(){
//     $('#schduleForm').hide();
//     $('#movieForm').show();
// }
function callBackFromShow(){
    $('#ShowMovieAll').hide();
    $('.content-view').show();
}
// function callBackFromMovie(){
//     $('#movieForm').hide();
//     $('.content-view').show();
// }


 $(document).on('click',".clickTable", select_theater);
 $(document).on('click',".clickTableBranch", branch);

$(document).on("click","#createMovie", callMovieForm);
$(document).on("click","#ShowMovie", ShowMovieForm);
$(document).on('click',"#addSchedule",addScheduleTable);
// $(document).on("click","#back", callBackMovieForm);
$(document).on("click","#backToAdmin", callBackFromShow);
// $(document).on("click","#Reject", callBackFromMovie);
// $(document).on("click","#createSchedule", sentMovieForm);
$(document).on("click",".deleteSchedule",deleteSchedule_list);
$(document).on("click","#createAllSchedule", createAllSchedules);

ScheduleInfo();
showbranch();
