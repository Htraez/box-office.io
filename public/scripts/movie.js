var theater




function BranchOption(){
    var payload = { table:"branch" };
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            // if(value.Position=="manager")
            $("#Branch").append('<option class="form-control-plaintext" value="'+value.BranchNo+'">'+value.BranchName+'</option>');
        });
        console.log(data)
    });
}



function showTheater(cl,data) {
    var payload = { table:"theatre" };
    console.log(branch)
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            if(cl==value.BranchNo)
            $("#theater").append('<tr class="default-mouse clickTable"><th class="text-white theaterTable" scope="col">'+value.TheatreCode+'</th></tr>');
            
        });
        console.log(data)
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

showmovie();

$(document).on('click',".movieTable",movie);
$(document).on('click',".branchTable",branch);
$(document).on('click',".theaterTable",theater);
$(document).on('click',".clickTable",function(){
    $(this).addClass('bg-secondary').siblings().removeClass('bg-secondary');
})



function callMovieForm(){
    $('#movieAndSchduleForm').show();
    $('.content-view').hide();
}

function callScheduleForm(){
    $('#schduleForm').show();
    $('#movieForm').hide();
    
}

function callBackMovieForm(){
    $('#schduleForm').hide();
    $('#movieForm').show();
}

$(document).on("click","#createMovie", callMovieForm);

$(document).on("click","#next", callScheduleForm);
$(document).on("click","#back", callBackMovieForm);
BranchOption();
