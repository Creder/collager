$(document).ready(() => {

  var myDropzone = new Dropzone(document.getElementById('direct_upload'), {
    uploadMultiple: false,
    acceptedFiles:'.jpg,.png,.jpeg,.gif',
    parallelUploads: 6,
    url: cloudinarySettings.url
  });

  myDropzone.on('sending', (file, xhr, formData) => {
    formData.append('api_key', cloudinarySettings.api_key);
    formData.append('timestamp', Date.now() / 1000 | 0);
    formData.append('upload_preset', cloudinarySettings.upload_preset);
  });

  myDropzone.on('success', (file, response) => {
    sendImage(response);
  });

  myDropzone.on('complete', (file) => {
    myDropzone.removeFile(file);
  });

  function formatString(fullUrl, signature){
    var index = fullUrl.indexOf("image/upload");
    return `${fullUrl.substring(index)}#${signature}`;
  }

  function sendImage(data){
    setImageData(data);
    submitForm(data);
    clearImageData();
  }

  function setImageData(data){
    var image = formatString(data.secure_url, data.signature);
    $('<input/>').attr({ name: 'photo[image]', value: image, type: "hidden"}).appendTo('form');
    $('#photo_bytes').val(data.bytes);
  }

  function submitForm(response){
    $.post($("form").attr("action"), $("form").serialize())
      .done((photo) => createImageElement(response, photo.id));
  }

  function clearImageData(){
    $("#photo_bytes").val('');
    $('input[name="photo[image]"]').remove();
  }

  function createImageElement(response, imgId){
    var img = $.cloudinary.image(response.public_id, { width: 400, height: 300, crop: 'fit', quality: 80 });
    console.log(img);
    var imgElement =`<div class="col-lg-3 col-md-4 col-xs-6 photo">
        <div class="img-border clearfix">
          ${img[0].outerHTML}
      </div>
        <!--<a class="delete-btn" rel="nofollow" data-id="${imgId}">
          ×
        </a>-->
      </div>`;
    $(".gallery").prepend($(imgElement).hide().fadeIn(1500));
  }

  $('.alert.alert-dismissible.alert-success').fadeOut(3000);

  $(document).on('click', 'a.delete-btn', function(e){
    if(confirm("You sure?")){
      var id = $(this).attr('data-id');
      $.when(deletePhoto(id))
        .then(removeImageElement(this));
    }
  });

  $('#direct_upload').on('drop',function(e){
    var imgUrl = e.originalEvent.dataTransfer.getData('Text');
    if (imgUrl && !imgUrl.includes("cloudinary.com")) {
      let fd = new FormData();
      fd.append('api_key', cloudinarySettings.api_key);
      fd.append('timestamp', Date.now() / 1000 | 0);
      fd.append('upload_preset', cloudinarySettings.upload_preset);
      fd.append('file', imgUrl);
      sendToCloud(fd, sendImage);
    }
  });

  function sendToCloud(formData, callback){
    $.ajax({
        url : cloudinarySettings.url,
        type: "POST",
        data : formData,
        processData: false,
        contentType: false,
        success: callback
    });
  }

  function removeImageElement(element){
    $(element).parent(".col-lg-3.col-md-4.col-xs-6.photo").fadeOut(1000);
  }

  function deletePhoto(id){
    $.ajax({
      url: `photos/${id}`,
      type: 'DELETE'
    });
  }
});
