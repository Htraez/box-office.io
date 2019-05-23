
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
            $("#theater").append('<li class="clickTable">'+value.TheatreCode+'</li>');  
        });
        console.log(data)
    });
    
}

function sentMovieForm(){
    var payloadMovie = {
        MovieName: $('#MovieName').val(),
        Director: $('#Director').val(),
        Casts: $('#Casts').val(),
        Desc: $('#Desc').val(),
        Duration: $('#Duration').val(),
        Rate: $('#Rate').val(),
        Genre: $('#Genre').val(),
        Studio: $('#Studio').val(),
        PosterURL: $('#PosterURL').val(),
    };
    var payloadSchdule = {
        TheatreCode: theater,
        Date: $('#Date').val(),
        Time: $('#datetime24').val(),
        Audio: $('#Audio').val(),
        Dimension: $('#Dimension').val(),
        Subtitle: $('#SubTitle').val(),

    };
    console.log(payload)
    if(payload.MovieName!='') $.post('/Movies',payload,(res)=>{
        console.log(success)
    });
}


function datetime(){
    $('#datetime24').combodate();  
}

function theater(){
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
function callScheduleForm(){
    $('#schduleForm').show();
    $('#movieForm').hide();
    branch = $('#Branch').val()
    showTheater();
}
function callBackMovieForm(){
    $('#schduleForm').hide();
    $('#movieForm').show();
}
function callBackFromShow(){
    $('#ShowMovieAll').hide();
    $('.content-view').show();
}
function callBackFromMovie(){
    $('#movieForm').hide();
    $('.content-view').show();
}
$(document).on('click',".theaterTable",theater);
$(document).on('click',".clickTable",function(){
    $(this).addClass('selected').siblings().removeClass('selected');
})
$(document).on("click","#createMovie", callMovieForm);
$(document).on("click","#ShowMovie", ShowMovieForm);

$(document).on("click","#next", callScheduleForm);
$(document).on("click","#back", callBackMovieForm);
$(document).on("click","#backToAdmin", callBackFromShow);
$(document).on("click","#Reject", callBackFromMovie);
BranchOption();
ScheduleInfo();


