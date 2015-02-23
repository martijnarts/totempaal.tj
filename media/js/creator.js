$(function(){
  var AUTH_CODE = '';

  $("body").removeClass("preload");

  // New
  $('#new').click(function() {
    close_doors();
    setTimeout(finish_new, 600);
  });
  function finish_new() {
    $('#title').val('').trigger('checkval');
    $('#slug').val('').prop('disabled', false);
    $('#content').val('').trigger('checkval');

    $('#images').find('li').remove();
    setTimeout(open_doors, 300);
  }

  // Save
  function save(publish, on_success) {
    if($('#slug').val() == '') { return; }
    if(typeof(publish) === 'undefined' || typeof(publish) === 'object') { publish = false; }

    $.ajax({
        type: 'POST',
        url: '/save',
        data: {
            'code': AUTH_CODE,
            'title': $('#title').val(),
            'slug': $('#slug').val(),
            'date': $('#date').val(),
            'tags': $('#tags').val(),
            'content': $('#content').val(),
            'publish': publish
        },
        success: function() {
          $('#save').removeClass('error').removeClass('success');
          $('#save').addClass('success');
          setTimeout(save_clear, 2000);

          if(typeof(on_success) !== 'undefined') { on_success(); }
        },
        error: function() {
          $('#save').removeClass('error').removeClass('success');
          $('#save').addClass('error');
          setTimeout(save_clear, 2000);
        }
    });
  }

  $('#save').click(save);
  function save_clear() {
    $('#save').removeClass('error').removeClass('success');
  }

  // Publish
  $('#publish').click(function() {
    save(true, function(){
      $.ajax({
          type: 'POST',
          url: '/publish',
          data: {
              'code': AUTH_CODE,
              'slug': $('#slug').val(),
          },
          success: function() {
            $('#publish').removeClass('error').removeClass('success');
            $('#publish').addClass('success');
            setTimeout(publish_clear, 2000);
          },
          error: function() {
            $('#publish').removeClass('error').removeClass('success');
            $('#publish').addClass('error');
            setTimeout(publish_clear, 2000);
          }
      });
    });
  });
  function publish_clear() {
    $('#publish').removeClass('error').removeClass('success');
  }

  // Load
  var dialog = $('#load-dialog').remove();
  $('#load').click(function() {
    $.ajax({
        type: 'POST',
        url: '/load',
        data: {
            'code': AUTH_CODE,
        },
        success: function(data) {
          $('body').prepend(dialog);
          setTimeout(unhide_dialog, 50);

          var wips = data.split(',');
          for(var i = 0; i < wips.length; i++) {
            dialog.find('ul').append('<li>' + wips[i] + '</li>');
          }
          dialog.find('li').on('click', load_wip);
        },
        error: function() {
          $('#publish').removeClass('error').removeClass('success');
          $('#publish').addClass('error');
          setTimeout(publish_clear, 2000);
        }
    });
  });
  function load_wip(e) {
    $.ajax({
      dataType: 'json',
      type: 'POST',
      url: '/load',
      data: {
        'code': AUTH_CODE,
        'slug': $(this).text(),
      },
      success: function(data) {
        close_doors();
        dialog.removeClass('show');
        setTimeout(hide_dialog, 550);
        setTimeout(finish_load_wip, 600, data);
      },
      error: function() {
        console.log('fail');
      }
    });
  }
  function finish_load_wip(data) {
    $('#title').val(data.title).trigger("checkval");
    $('#slug').val(data.slug).prop('disabled', true);
    $('#date').val(data.date);
    $('#tags').val(data.tags);
    $('#content').val(data.content).trigger("checkval");

    $('#images').find('li').remove();
    for(var i = 0; i < data.images.length; i++) {
      $('#images').append('<li>' +
                            '<input type="text" ' +
                             'data-original="' + data.images[i] + '" ' +
                             'value="' + data.images[i] + '">' +
                          '</li>');
      $('#images li input').last().on('blur', rename).on('keyup', rename);
    }

    setTimeout(open_doors, 300);
  }
  function rename(e) {
    if(e.type == 'keyup' && e.which != 13) { return }

    var original = $(this).attr('data-original'),
        new_val = $(this).val(),
        li = $(this).parent();
    if(original == new_val) { return }
    if(li.children('input').prop('disabled')) { return }

    li.children('input').prop('disabled', true);
    $.ajax({
        type: 'POST',
        url: '/rename_image',
        data: {
          'code': AUTH_CODE,
          'slug': $('#slug').val(),
          'original': original,
          'new': new_val,
        },
        success: function(data) {
          li.addClass('success');
          li.children('input').attr('data-original', data);
          li.children('input').prop('disabled', false);
          setTimeout(reset_image, 2000, li);
        },
        error: function() {
          li.addClass('error');
          li.children('input').val(li.children('input').attr('data-original'));
          li.children('input').prop('disabled', false);
          setTimeout(reset_image, 2000, li);
        }
    });
  }
  function reset_image(li) {
    li.removeClass('error').removeClass('success');
  }
  function hide_dialog() {
    dialog.find('li').remove();
    dialog.remove();
  }
  function unhide_dialog() {
    dialog.addClass('show');
  }
  function publish_clear() {
    $('#publish').removeClass('error').removeClass('success');
  }

  // Drag 'n Drop Uploader!
  var progress_bar = $('.progress_bar').remove();
  $('#add_image').on('drop', function(event) {
    var files = event.originalEvent.dataTransfer.files,
        formData = new FormData();
    if(files.length == 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    formData.append('files', files[0]);
    formData.append('code', AUTH_CODE);
    formData.append('slug', $('#slug').val());

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload_images');
    xhr.onload = function() {
      xhr.li.find('.progress_bar').addClass('hide');
    };

    xhr.upload.onprogress = function(event) {
      if(event.lengthComputable) {
        var complete = (event.loaded / event.total * 100 | 0);

        xhr.li.find('.progress_bar div').css('width', complete + '%');
        xhr.li.find('.progress_bar span').text(complete + '%');
      }
    };

    $('#images').append('<li>' +
                           '<input type="text" ' +
                            'data-original="' + files[0].name + '" ' +
                            'value="' + files[0].name + '">' +
                         '</li>');
    $('#images li input').last().on('blur', rename).on('keyup', rename);

    xhr.li = $('#images li').last();
    xhr.send(formData);

    xhr.li.append(progress_bar.clone());

    xhr.li.find('#progress_bar div').css('width', '0%');
    xhr.li.find('#progress_bar span').text('0%');
  }).on('dragover', function (e) {
    e.preventDefault();
  });

  // Slug field
  $('#slug').bind('blur', function() {
    var val = $(this).val();
    val = val.replace(/[^a-zA-Z0-9 _]/g, '');
    val = val.replace(/ /g, '_');
    val = val.toLowerCase().substr(0, 32);
    val = val.replace(/_+/g, '_')
    val = val.replace(/^_/g, '').replace(/_$/g, '')
    $(this).val(val.substr(0, 32));
  });
  $('#title').bind('blur', function() {
    if($('#slug').val() === '') {
      $('#slug').val($(this).val()).trigger('blur');
    }
  });

  // Magic labels
  var onClass = "on";
  var showClass = "show";

  $("input").add('textarea').bind("checkval",function(){
    var label = $(this).prev("label");
    if(this.value !== ""){
      label.addClass(showClass);
    } else {
      label.removeClass(showClass);
    }
    check_fields();
  }).on("keyup",function(){
      $(this).trigger("checkval");
  }).on("focus",function(){
      $(this).prev("label").addClass(onClass);
  }).on("blur",function(){
      $(this).prev("label").removeClass(onClass);
  }).trigger("checkval");

  // Autoresizing textarea
  var txt = $('#content'),
    hiddenDiv = $(document.createElement('div')),
    content = null;
  hiddenDiv.addClass('hiddendiv common');
  $('body').append(hiddenDiv);

  txt.on('checkval', function() {
    content = $(this).val();

    content = content.replace(/\n/g, '<br>');
    hiddenDiv.html(content + '<br><br>');

    $(this).css('height', hiddenDiv.height());
  }).on("keyup",function(){
    $(this).trigger("checkval");
  });


  // Login form stuff
  function check_login() {
    var username = $('#username').val(),
        password = $('#password').val();

    $.ajax({
        type: 'POST',
        url: '/login',
        data: {'username': username, 'password': password},
        success: function(data) {
          AUTH_CODE = data;
          open_creator();
        },
        error: function() {
          $('#login input').prop('disabled', false);
          $('.button').removeClass('loader');

          $('#login button').removeClass('error');
          $('#login button').addClass('error');
          setTimeout(login_clear_error, 2000);
          $('#username').focus();
        }
    });
  }
  function open_creator() {
    $("#login").addClass('hide');
    setTimeout(open_doors, 500);
  }
  function open_doors() {
    $('#login').remove();
    $('#doors').addClass('open');
    $('#title').focus();
  }
  function close_doors(login) {
    if(login === true) {
      $('#login').remove();
      $('#username').focus();
    }
    $('#doors').removeClass('open');
  }
  function login_clear_error() {
    $('#login button').removeClass('error');
  }

  function check_fields() {
    if($('#username').val() !== '' && $('#password').val() !== '') {
      $('#login button').prop('disabled', false);
    } else {
      $('#login button').prop('disabled', true);
    }
  }

  $('#login button').click(function(e) {
    $('#login input').prop('disabled', true);
    $('.button').addClass('loader');
    e.preventDefault();
    check_login();
  });
});
