var movie
var branchName
var theater
var temp

function showmovie(data) {
    var payload = { table:"movie" };
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            
            $("#Movie").append('<tr class="default-mouse clickTable"><th class="text-white movieTable" scope="col"value="'+value.MovieNo+'">'+value.MovieNo+value.MovieName+'</th></tr>');
        });
        console.log(data)
    });
    
}
function showbranch(data) {
    var payload = { table:"branch" };
    $.post('/fetchData',payload,(data)=>{
        data.forEach((value,key)=>{
            
            $("#Branch").append('<tr class="default-mouse clickTable"><th class="text-white branchTable" scope="col">'+value.BranchNo+'</th></tr>');
        });
        console.log(data)
    });
    
}

function showTheater(cl,data) {
    var payload = { table:"theatre" };
    console.log(branch.temp)
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

function movie(){
    console.log(this.innerHTML);
    temp = this.innerHTML;
    movie = temp.replace(/\D/g, "");
    console.log(movie)
    showbranch();
}
function branch(){
    console.log(this.innerHTML);
    branchName = this.innerHTML;
    console.log(branchName)
    showTheater(branchName,);

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



