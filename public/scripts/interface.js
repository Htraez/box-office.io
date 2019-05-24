let nowShowing = undefined;
let webState = undefined;
$(document).ready(function(){
    webState = new webstate(auth);
});

$(document).on("keydown", "form.preventEnter", function(event) { 
    return event.key != "Enter";
    //prevent hitting enter in form
});

$('.popup-area, #popup-close, .close-key').click(function(e){
    if(e.target != this && e.target != this.children[0]) return;
    $('.web-body').removeClass('overlay');
    $(this).closest('.popup-area').hide();
});

$('.web-body').on('popup-closeAll', function(){
    $('.web-body').removeClass('overlay');
    $('.popup-area').hide();
});

$('button, .side-bar-icon, a').click(function(){
    let popupId = $(this).data('popup');
    if(popupId){
        $('.web-body').addClass('overlay');
        $('#'+popupId).trigger('init').show();
    }
})

$('.logo').dblclick(function(){
    $('.content-box').toggleClass('special-mode');
});

$('button').on('reset', function(e, isDisable=true, moreClass=undefined){
    if($(this).data('default-disable')&&isDisable) $(this).prop("disabled", true);
    if(typeof $(this).data('default-class') != 'undefined'||moreClass) $(this).attr( "class", $(this).data('default-class')+' '+(moreClass?moreClass:''));
    if(typeof $(this).data('default-txt') != 'undefined') $(this).find('span').text($(this).data('default-txt'));
});