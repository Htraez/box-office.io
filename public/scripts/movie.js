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

BranchOption();