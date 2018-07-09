function! s:goyo_enter()
  set noshowmode
  set noshowcmd
  set scrolloff=999

  colo seoul256
  set listchars=tab:»\ ,trail:·,extends:…

  Limelight

  set rnu!
  unmap <silent><leader>l
  set nonumber

    autocmd! InsertEnter,FocusLost,WinLeave,CmdwinLeave *
    autocmd! InsertLeave,FocusGained,WinEnter,CmdwinEnter *
endfunction

function! s:goyo_leave()
  set showmode
  set showcmd
  set scrolloff=5

  colo zenburn
  set listchars=tab:»\ ,trail:·,extends:…,eol:¶

  Limelight!
endfunction

autocmd! User GoyoEnter nested call <SID>goyo_enter()
autocmd! User GoyoLeave nested call <SID>goyo_leave()
let g:goyo_width = 81
