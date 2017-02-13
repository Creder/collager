$(document).ready(function(){
  $('#gallery').on('click',() => {
    document.getElementById("mySidenav").style.width = "40%";
    document.getElementById("gallery-close").style.display = "block";
  });

  $('button.closebtn').on('click',() => {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("gallery-close").style.display = "none";
  });

  $('#settings').on('click',() => {
    document.getElementById("settings-nav").style.width = "20%";
    document.getElementById("settings-close").style.display = "block";
  });

  $('button.settings-closebtn').on('click',() => {
    document.getElementById("settings-nav").style.width = "0";
    document.getElementById("settings-close").style.display = "none";
  });
  let directUpload = $('div#direct_upload'),
      activeObject;
  let currentDivHeight = directUpload.height(),
      currentDivWidth = directUpload.width(),
      currentDivLeft = directUpload.position().left,
      currentDivTop = directUpload.position().top;

  let canvas = this.__canvas = new fabric.Canvas("c");
  canvasSize(600, 800);
  canvas.backgroundColor = "#fff";
  canvas.selection = false;
  canvas.renderAll();
  let f = fabric.Image.filters;
  let filters = ['sepia2','grayscale','invert'];

  let filterInfo = {
    sepia2: {index:0, offset: 0, title: "S", type: "sepia2", filter: new f.Sepia2()},
    grayscale: {index:1, offset: 50, title: "G", type: "grayscale", filter: new f.Grayscale()},
    invert: {index:2, offset: 100, title: "I", type: "invert", filter: new f.Invert()}
  };

  directUpload.scrollTop(0);
  directUpload.scrollLeft(0);
  setItemsControlOptions();

  let json = $("#collage_collage_json").val();
  if(json !== ""){
    let parsedJSON = JSON.parse(json);
    canvasSize(parsedJSON.canvasHeight, parsedJSON.canvasWidth);
    canvas.loadFromJSON(json, canvas.renderAll.bind(canvas));
  }

  var timerId = setInterval(function() {
    canvasImg();
  }, 5000);

  Object.keys(filterInfo).forEach((key) => {
    let id = `#${filterInfo[key].type}`;
    setButtonFilterHandler(id);
    setButtonFilterHover(id);
  });

  fabric.Canvas.prototype.getAbsoluteCoords = function(object) {
    return {
      left: object.left + this._offset.left,
      top: object.top + this._offset.top
    };
  }

  $("#remove-img").on("click", removeElement);

  function removeElement(){
    if(activeObject)
      activeObject.remove();
  }

  $("#direct_upload").scroll(function() {
    buttonEvent(removeButton);
    canvas.deactivateAll().renderAll();
  });

$('#angle-control').on("change mousemove", function(){
    buttonEvent(removeButton);
    if(activeObject){
      activeObject.setAngle(parseInt(this.value, 10)).setCoords();
    }
    canvas.renderAll();
    initButtons();
  });
  $('#scale-control').on("change mousemove", function(){
    buttonEvent(removeButton);
    if(activeObject){
      activeObject.scale(parseFloat(this.value)).setCoords();
    }
    canvas.renderAll();
    initButtons();
  });

  $('#save-img').on("click",saveImg);

  function updateControls() {
    if(activeObject){
      $("#scale-control").val(activeObject.getScaleX());
      $("#z-index").val(activeObject.zIndex);
    }
  }

  function setZIndex(){
    let i = 0;
    canvas.getObjects().sort(function (a, b) {
      if (a.zIndex > b.zIndex){
        return 1;
      }
      if (a.zIndex < b.zIndex){
        return -1;
      }
      return 0;
    }).forEach((item) => {
      item.moveTo(i);
      i+=1;
    });
  }


  function setButtonFilterHandler(id){
    $(document).on("click", id, function(e) {
      let filter = getFilter(this),
          index = getFilterIndex(this);
      setFilterConfirm(index);
      applyFilter(index, filter);
    });
  }

  function canvasSize(height, width){
    canvas.setHeight(height);
    canvas.setWidth(width);
    $("#canvas-width").val(canvas.getWidth());
    $("#canvas-height").val(canvas.getHeight());
  }

  $('#canvas-width').bind("enterKey",function(e){
    canvas.setWidth(parseFloat(this.value));
  });

  $('#canvas-height').bind("enterKey",function(e){
    canvas.setHeight(parseFloat(this.value));
  });

  $('#z-index').bind("enterKey",function(e){
    if(activeObject){
      activeObject.zIndex = parseInt(this.value);
      setZIndex();
    }
  });

  $("#canvas-width,#canvas-height,#z-index").keyup(function(e){
    if(e.keyCode == 13) {
        $(this).trigger("enterKey");
      }
  });

  function setButtonFilterHover(id){
    $(document).on({
      mouseenter: function () {
        setTimeout(() => {
          let currElement = getElementInfo(this);
          if (!currElement.el.filtersConfirm[currElement.index] &&
              !currElement.el.filters[currElement.index]){
            applyFilter(currElement.index, currElement.filter);
          }
        }, 100);

      },
      mouseleave: function () {
        setTimeout(dismissFilters, 100)
      }
    }, id);
  }

  function dismissFilters(){
    for(let i in filters)
      if(!activeObject.filtersConfirm[i])
        activeObject.filters[i] = false;

    activeObject.applyFilters(canvas.renderAll.bind(canvas));
  }

  function buttonEvent(callback){
    Object.keys(filterInfo).forEach((key) => {
      var id = `#${filterInfo[key].type}`;
      callback(id);
    });
  }

  function removeButton(id){
    $(id).remove();
  }

  function hideButton(id){
    $(id).hide();
  }

  function showButton(id){
    $(id).show();
  }

  function getFilter(element){
    return filterInfo[element.id].filter;
  }

  function getFilterIndex(element){
    return filterInfo[element.id].index;
  }

  function setFilterConfirm(index){
    activeObject.filtersConfirm[index] = !activeObject.filtersConfirm[index];
  }

  function getElementInfo(element){
    return currElement = {
      el: activeObject,
      filter: getFilter(element),
      index: getFilterIndex(element)
    };
  }

  function createButton(type, title){
    template = `<input type="checkbox"
      id=${type} value=${title} class="btn btn-primary btn-filter"/>`;

    return $(template);
  }

  function positionBtn(id) {
    let btn = $(id)[0];
    if (btn){
      let btnWidth = btn.style.width,
          btnHeight = btn.style.height,
          btnOffset = filterInfo[id.replace("#","")].offset,
          absCoords = calcButtonCoords();

      btn.style.left = (absCoords.left - btnWidth / 2) + btnOffset + 'px';
      btn.style.top = (absCoords.top - btnHeight / 2) - 38 + 'px';
    }
  }

  function calcButtonCoords(){
    if(activeObject){
      let coords = getAbsoluteCoords();
      coords.top += activeObject.getHeight();
      return coords;
    }
  }

  function getActiveObject(){
    return canvas.activeObject;
  }

  function getAbsoluteCoords(){
    return canvas.getAbsoluteCoords(activeObject);
  }

  function setItemsControlOptions(item){
    if(item){
      item.hasControls = false;
    }
  }

  function applyFilter(index, filter) {
    var obj = activeObject;
    obj.filters[index] = obj.filters[index] ? false : filter;
    if(obj.filtersConfirm[index] && obj.filters[index] === false){
      obj.filters[index] = filter;
    }
    obj.applyFilters(canvas.renderAll.bind(canvas));
  }

  function applyFilterValue(index, prop, value) {
    var obj = activeObject;
    if (obj.filters[index]) {
      obj.filters[index][prop] = value;
      obj.applyFilters(canvas.renderAll.bind(canvas));
    }
  }

  function moveRightLeft(wrapDiv, divOffsetLeft, element, xScale){
    if (currentDivWidth + divOffsetLeft < element.left + element.width*xScale){
      wrapDiv.scrollLeft(divOffsetLeft + 5);
    }else if(currentDivLeft + divOffsetLeft > element.left){
      wrapDiv.scrollLeft(divOffsetLeft - 5);
    }
  }

  function moveTopBot(wrapDiv, divOffsetTop, element, yScale) {
    if (currentDivTop + divOffsetTop > element.top){
      wrapDiv.scrollTop(divOffsetTop - 5);
    }else if(currentDivHeight + divOffsetTop < element.top - element.height*yScale){
      wrapDiv.scrollTop(divOffsetTop + 5);
    }
  }

  function move(element, xScale, yScale){
    let wrapDiv = $("div#direct_upload");
    let divOffsetLeft = wrapDiv.scrollLeft(),
        divOffsetTop = wrapDiv.scrollTop();
    moveRightLeft(wrapDiv, divOffsetLeft, element, xScale);
    moveTopBot(wrapDiv, divOffsetTop, element, yScale);
    canvas.calcOffset.bind(canvas)
  }

  getDefaultZIndex = () => canvas.getObjects().indexOf(activeObject);

  function initButtons(){
    if(activeObject){
      Object.keys(filterInfo).forEach((key)=>{
        let filter = filterInfo[key];
        let coords = calcButtonCoords();
        let btn = createButton(filter.type, filter.title);
        btn.css({
                  position: 'absolute',
                  top: coords.top - 34,
                  left: coords.left + filter.offset
              });
        $("body").append(btn);
      });
    }
  }

function activeControlls(){
  $("#controlls").removeAttr('disabled');
}

function disableControlls(){
  $("#controlls").attr('disabled',true);
}

function saveImg(){
  window.open(canvas.toDataURL('png'));
  canvasImg();
}

  canvas.on({
  'object:selected': function(e) {
    if(activeObject){
      dismissFilters();
    }
    activeObject = e.target;
    buttonEvent(removeButton);
    initButtons();
    updateControls();
    activeControlls();
  },
  'selection:cleared': function() {
    buttonEvent(removeButton);
    disableControlls();
    if(activeObject){
      dismissFilters();
      activeObject = null;
    }
  },
  'object:added': (e) => {
    let element = e.target;
    setItemsControlOptions(e.target);
    element.zIndex = element.zIndex ? element.zIndex : false;
    element.filtersConfirm = [];
    element.filters.forEach((f) => {
      let acceptedFilter = filterInfo[f.type.toLowerCase()];
      let index = acceptedFilter.index;
      element.filters[index] =  acceptedFilter.filter;
      element.filtersConfirm[index] = true;
    });
    for(let i = 0; i < filters.length; i++){
      if(!element.filtersConfirm[i]){
        element.filters[i] = element.filtersConfirm[i] = false;
      }
    }
    if(element.zIndex === false){
      calcIndexes();
    }
  },
  'object:moving': (e) => {
    let element = e.target;
    let xScale = element.getScaleX(),
        yScale = element.getScaleY();
    move(element, xScale, yScale);
  },
  'mouse:down': (e) => {
    buttonEvent(hideButton);
  },
  'mouse:up':(e) => {
    buttonEvent(showButton);
    buttonEvent(positionBtn);
  }
  });

  function calcIndexes(){
    let obj = canvas.getObjects();
    obj.forEach((e) => {
      if(e.zIndex === false){
        e.zIndex = 0;
      }else{
        e.zIndex++;
      }
    });
    setZIndex();
  }

  function sendCanvasJson(){
    let canvasInfo = canvas.toJSON();
    let obj = canvas.getObjects();
    canvasInfo.canvasHeight = canvas.getHeight();
    canvasInfo.canvasWidth = canvas.getWidth();
    for(let i = 0; i < obj.length; i++){
      canvasInfo.objects[i].zIndex = obj[i].zIndex;
    }
    let canvasJson = JSON.stringify(canvasInfo);
    $('#collage_collage_json').val(canvasJson);
    submitJsonForm();
  }

  function submitJsonForm(){
    let form = $("form[id^='edit_collage']");
    $.ajax({
      type: 'PUT',
      url: form.attr("action"),
      data: form.serialize()
    });
  }
  function getFormData(){
    let fd = new FormData();
    return appendFormData(fd);
  }

  function appendFormData(fd) {
    fd.append('api_key', cloudinarySettings.api_key);
    fd.append('timestamp', Date.now() / 1000 | 0);
    fd.append('upload_preset', cloudinarySettings.upload_preset);
    return fd;
  }

  function canvasImg() {
    let fd = getFormData();
    fd.append('file', canvas.toDataURL('png'));
    sendToCloud(fd, sendCanvasData);
  }

  function sendCanvasData(data){
    $("#collage_public_id").val(data.public_id);
    $("#collage_image").val(data.secure_url);
    sendCanvasJson();
  }

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

  var myDropzone = new Dropzone(document.getElementById('direct_upload'), {
    uploadMultiple: false,
    clickable: false,
    acceptedFiles:'.jpg,.png,.jpeg,.gif,image/*',
    parallelUploads: 6,
    url: cloudinarySettings.url
  });

  myDropzone.on('sending', (file, xhr, formData) => {
    formData = appendFormData(formData);
  });

  myDropzone.on('success', (file, response) => {
    sendImage(response);
  });

  myDropzone.on('complete', (file) => {
    myDropzone.removeFile(file);
  });

  $('#direct_upload').on('drop',function(e){
    var imgUrl = e.originalEvent.dataTransfer.getData('Text');
    if(imgUrl && imgUrl.includes("cloudinary.com")){
      imgUrl = imgUrl.replace("/c_fit,h_100,w_250","");
      addImageToCanvas({secure_url: imgUrl});
    }else if (imgUrl) {
      let fd = getFormData();
      fd.append('file', imgUrl);
      sendToCloud(fd, sendImage);
    }
  });

  function formatString(fullUrl, signature){
    var index = fullUrl.indexOf("image/upload");
    return `${fullUrl.substring(index)}#${signature}`;
  }

  function addImageToSidebar(response){
    let img = $.cloudinary.image(response.public_id, { width: 250, height: 100, crop: 'fit' });
    let template = `
    <div class="col-md-6 clearfix" style="height:100px;margin-bottom:5px;">
      ${img[0].outerHTML}
    </div>`
    $(template).prependTo("#mySidenav");
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
    $.post($("form#new_photo").attr("action"), $("form#new_photo").serialize())
      .done(() => {
        addImage(response);
      });
  }

  function addImage(response){
    addImageToCanvas(response);
    addImageToSidebar(response);
  }

  function addImageToCanvas(response){
    fabric.Image.fromURL(response.secure_url, function(img) {
      canvas.add(img.set({
        left: directUpload.scrollLeft(),
        top: directUpload.scrollTop()}));
    }, {crossOrigin: "anonymous"});
  }

  function clearImageData(){
    $("#photo_bytes").val('');
    $('input[name="photo[image]"]').remove();
  }
});
