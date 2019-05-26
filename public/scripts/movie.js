
var theater;
var branchName;
var schedule_list =[];
var test;
var Movies;

function ScheduleInfo(cl,data) {
    var payload = { table:"schedule" };
    $("#Schedule").find('li').remove();
    console.log(cl)
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            if(cl==value.MovieNo)
                {
                $("#Schedule").append('<li value="'+value.ScheduleNo+'">'+value.ScheduleNo+'&emsp;'+value.MovieNo+'&emsp;'+value.TheatreCode+'&emsp;'+value.Date+'&emsp;'+value.Time+'&emsp;'+value.Audio+'&emsp;'+value.Dimension+'&emsp;'+value.Subtitle+'</li>');
                }
        });
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

function showmovie(data) {
    var payload = { table:"movie" };
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            
            $("#Movie").append('<li class="MovieTable" value="'+value.MovieNo+'">'+value.MovieName+'</li>');
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
    if($('#DateStart').val()!="" && theater != undefined ){
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
            console.log(temp)
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
     if(payload.Movie.MovieName!=''&&payload.Movie.Director!=''&&payload.Movie.Casts!=''&&payload.Movie.Desc&&payload.Movie.Duration!=''&&payload.Movie.Genre!=''&&payload.Movie.Rate!=''&&payload.Movie.Studio!=''&&payload.Movie.PosterURL!='') {
        $.ajax({
            type:"POST",
            url: "/movies",
            data: payload,
            success: function(data) {
                window.location.replace("/admin");  
            }
        })
     }
     else console.log("error")
}

// function datetime(){
//     $('#datetime24').combodate();  
// }
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

function select_Movie(){
    $(this).addClass('selected').siblings().removeClass('selected')
    console.log(this.value);
    Movies = this.value;
    $('#Schedule').show();
    ScheduleInfo(Movies,);
}


function callMovieForm(){
    $('#movieAndSchduleForm').show();
    $('.content-view').hide();
    $('#ShowMovieAll').hide();
}


function callBackFromShow(){
    $('#ShowMovieAll').hide();
    $('.content-view').show();
}

function cancelAllSchedule(){
    while (schedule_list.length){
         schedule_list.pop(); 
        }
    $('#movieAndSchduleForm').hide();
    $('.content-view').show();
}



 $(document).on('click',".clickTable", select_theater);
 $(document).on('click',".clickTableBranch", branch);
$(document).on("click","#createMovie", callMovieForm);
$(document).on('click',".MovieTable",select_Movie);
$(document).on('click',"#addSchedule",addScheduleTable);
$(document).on("click","#backToAdmin", callBackFromShow);
$(document).on("click",".deleteSchedule",deleteSchedule_list);
$(document).on("click","#createAllSchedule", createAllSchedules);   
$(document).on("click","#cancelAllSchedule", cancelAllSchedule);  
// ScheduleInfo();
showbranch();
showmovie();