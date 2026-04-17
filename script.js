let folders = JSON.parse(localStorage.getItem('folders')) || {};
let deletedStack = [];
let currentFolder = null;

function saveData(){
  localStorage.setItem('folders', JSON.stringify(folders));
}

function renderFolders(filter=""){
  $('#folders').html('');

  for(let folder in folders){
    if(!folder.toLowerCase().includes(filter.toLowerCase())) continue;

    $('#folders').append(`
      <div class="folder" data-folder="${folder}">
        📁 <b>${folder}</b>
        <button class="deleteFolder" data-folder="${folder}">Delete</button>
      </div>
    `);
  }
}

/* OPEN */
$(document).on('dblclick','.folder',function(){
  currentFolder = $(this).data('folder');

  localStorage.setItem('currentFolder', currentFolder);

  $('#folders').hide();
  $('#folderView').show();
  $('.top-bar').hide();

  $('#currentFolderTitle').text("📂 " + currentFolder);

  renderInsideFolder();
});

/* BACK */
$('.backBtn').click(function(){
  localStorage.removeItem('currentFolder');

  $('#folderView').hide();
  $('#folders').show();
  $('.top-bar').show();
});

/* INSIDE FOLDER */
function renderInsideFolder(){
  let box = $('.images');
  box.html('');

  folders[currentFolder].forEach((img,index)=>{
    box.append(`
      <div class="img-card">
        <img src="${img}">
        <button class="deleteImg" data-index="${index}">Delete</button>
      </div>
    `);
  });
}

/* CREATE FOLDER */
$('#createFolderBtn').click(()=>{
  $('#folderPopup').show();
  $('#mainContent').addClass('blur-bg');
  $('#folderName').val('').focus();
});

$('#cancelFolder').click(()=>{
  $('#folderPopup').hide();
  $('#mainContent').removeClass('blur-bg');
});

$('#saveFolder').click(function(){
  let name = $('#folderName').val().trim();

  if(name && !folders[name]){
    folders[name] = [];
    saveData();
    renderFolders();

    $('#folderPopup').hide();
    $('#mainContent').removeClass('blur-bg');
  }else{
    alert("Invalid or duplicate folder");
  }
});

/* DELETE FOLDER */
$(document).on('click','.deleteFolder',function(e){
  e.stopPropagation();

  let folder = $(this).data('folder');

  Swal.fire({
    title:'Delete folder?',
    icon:'warning',
    showCancelButton:true,
    confirmButtonText:'Yes'
  }).then((res)=>{
    if(res.isConfirmed){
      deletedStack.push({name:folder,data:folders[folder]});
      delete folders[folder];
      saveData();
      renderFolders();
    }
  });
});

/* UPLOAD */
$(document).on('change','.uploadInside',function(e){
  let file = e.target.files[0];

  let reader = new FileReader();
  reader.onload = function(e){
    folders[currentFolder].push(e.target.result);
    saveData();
    renderInsideFolder();
  }
  reader.readAsDataURL(file);
});

/* DELETE IMAGE */
$(document).on('click','.deleteImg',function(){
  let index = $(this).data('index');

  Swal.fire({
    title:'Delete image?',
    icon:'warning',
    showCancelButton:true
  }).then((res)=>{
    if(res.isConfirmed){
      folders[currentFolder].splice(index,1);
      saveData();
      renderInsideFolder();
    }
  });
});

/* UNDO */
$('#undoBtn').click(function(){

  if(deletedStack.length === 0){
    Swal.fire({
      icon:'info',
      title:'Nothing to Undo'
    });
    return;
  }

  let last = deletedStack.pop();
  folders[last.name] = last.data;
  saveData();
  renderFolders();
});

/* SEARCH */
$('#search').on('keyup',function(){
  renderFolders($(this).val());
});

/* INIT */
renderFolders();

$(document).ready(function(){
  let savedFolder = localStorage.getItem('currentFolder');

  if(savedFolder && folders[savedFolder]){
    currentFolder = savedFolder;

    $('#folders').hide();
    $('#folderView').show();
    $('.top-bar').hide();

    $('#currentFolderTitle').text("📂 " + currentFolder);

    renderInsideFolder();
  }
});