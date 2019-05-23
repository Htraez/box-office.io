var theater
var branch




function BranchOption(){
    var payload = { table:"branch" };
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            
            $("#Branch").append('<option class="form-control-plaintext" value="'+value.BranchNo+'">'+value.BranchName+'</option>');
        });
        console.log(data)
    });
}



function ScheduleInfo(data) {
    var payload = { table:"schedule" };
    $("#Schedule").find('tr').remove();
    console.log('A');
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            
            $("#Schedule").append('<tr class="default-mouse clickTable"><th class="text-white movieTable" scope="col"value="'+value.ScheduleNo+'">'+value.ScheduleNo+'&emsp;'+value.MovieNo+'&emsp;'+value.TheatreCode+'</th></tr>');
        });
        console.log(data)
    });
    
}

function showTheater(data) {
    var payload = { table:"theatre" };
    $("#theater").find('tr').remove()
    console.log(branch)
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            if(branch==value.BranchNo)
            $("#theater").append('<tr class="default-mouse clickTable"><th class="text-white theaterTable" scope="col">'+value.TheatreCode+'</th></tr>');
            
        });
        console.log(data)
    });
    
}



function callMovieForm(){
    $('#movieAndSchduleForm').show();
    $('.content-view').hide();
}

function ShowMovieForm(){
    $('#ShowMovieAll').show();
    $('.content-view').hide();
}

function callScheduleForm(){
    $('#schduleForm').show();
    $('#movieForm').hide();
    branch = $('#Branch').val()
    showTheater()
    
}

function callBackMovieForm(){
    $('#schduleForm').hide();
    $('#movieForm').show();
}

function callBackAdmin(){
    $('#ShowMovieAll').hide();
    $('.content-view').show();
}

$(document).on("click","#createMovie", callMovieForm);
$(document).on("click","#ShowMovie", ShowMovieForm);

$(document).on("click","#next", callScheduleForm);
$(document).on("click","#back", callBackMovieForm);
$(document).on("click","#backToAdmin", callBackAdmin);
BranchOption();
ScheduleInfo();

