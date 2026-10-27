  // BUGFIX PS7: PDF preparation and user-initiated browser save/share/print controls.
  const PS7 = (()=>{
    const api={enabled:()=>PDF_SAVE_WORKFLOW_ENABLED && PX7.enabled() && PDF111.enabled()};let active=null,serial=0;
    function close(){if(!active)return;serial++;const {dialog,focus}=active;active=null;dialog.close();dialog.remove();if(focus?.isConnected)focus.focus();}
    api.close=close;
    api.save=async result=>{
      const blob=new Blob([result.bytes],{type:'application/pdf'});
      if(typeof window.showSaveFilePicker==='function'){
        const handle=await window.showSaveFilePicker({suggestedName:result.filename,types:[{description:'PDF document',accept:{'application/pdf':['.pdf']}}]});
        const stream=await handle.createWritable();try{await stream.write(blob);await stream.close();}catch(error){try{await stream.abort();}catch{}throw error;}
        return 'PDF saved.';
      }
      const file=new File([blob],result.filename,{type:'application/pdf'});
      if(navigator.canShare?.({files:[file]})&&typeof navigator.share==='function'){
        await navigator.share({files:[file],title:result.filename});return 'PDF shared or saved.';
      }
      PX7.download(result);return 'PDF sent to your browser downloads.';
    };
    api.preview=result=>{
      const url=URL.createObjectURL(new Blob([result.bytes],{type:'application/pdf'}));
      const opened=window.open(url,'_blank');setTimeout(()=>URL.revokeObjectURL(url),300000);
      if(!opened)throw Error('The PDF preview was blocked. Allow pop-ups for this app, or save the PDF and open it to print.');
      try{opened.opener=null;}catch{}return 'PDF opened. Use the PDF viewer’s Print command.';
    };
    api.open=async id=>{
      if(!api.enabled()||active||currentId!==id)return false;
      try{
        const snapshot=PX7.snapshot(),dialog=document.createElement('dialog'),focus=document.activeElement,token=++serial;
        dialog.id='ps7-dialog';dialog.setAttribute('aria-labelledby','ps7-title');
        dialog.style.cssText='width:min(30rem,calc(100vw - 2rem));box-sizing:border-box;max-height:90dvh;overflow:auto;padding:1.25rem;border:1px solid #9b8056;border-radius:10px;background:#faf5e8;color:#29241e';
        dialog.innerHTML='<h2 id="ps7-title">Export or print PDF</h2><p>Choose a filename and prepare your character sheet.</p><label for="ps7-name">Filename</label><input id="ps7-name" type="text" maxlength="124" style="display:block;box-sizing:border-box;width:100%;margin:.4rem 0 1rem;min-height:44px"><div id="ps7-options"></div><p id="ps7-status" role="status" aria-live="polite"></p><div style="display:flex;gap:.5rem;flex-wrap:wrap"><button type="button" id="ps7-prepare">Prepare PDF</button><button type="button" id="ps7-save" hidden>Save PDF</button><button type="button" id="ps7-preview" hidden>Open PDF to print</button><button type="button" id="ps7-close">Close</button></div><p><small>Save uses a save dialog or share sheet where supported. Otherwise your browser controls the download location.</small></p>';
        const find=id=>dialog.querySelector('#ps7-'+id),name=find('name'),status=find('status');name.value=PX7Logic.filename(snapshot.fields.f_name).replace(/\.pdf$/i,'');
        let options=()=>({});
        // UI hook: the optional appendix owns its checkbox and can be removed independently.
        if(typeof PDA7==='object'&&PDA7?.enabled())options=PDA7.mount(find('options'));
        active={dialog,focus,id,snapshot,result:null,token};
        const valid=()=>{if(active?.token!==token)return false;if(currentId!==id){status.textContent='The selected character changed. Close this dialog and export the current character.';return false;}return true;};
        function invalidate(){if(active?.token!==token)return;active.result=null;find('save').hidden=true;find('preview').hidden=true;}
        find('options').addEventListener('change',()=>{invalidate();status.textContent='Options changed. Prepare the PDF again.';});
        find('close').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
        find('prepare').onclick=async()=>{
          if(!valid()||find('prepare').disabled)return;
          try{
            PS7Logic.filename(name.value);name.removeAttribute('aria-invalid');invalidate();find('prepare').disabled=true;status.textContent='Preparing PDF…';
            const input=JSON.parse(JSON.stringify(snapshot));input.pdfOptions=options();
            const result=await PX7Writer.generate(input);
            if(!valid())return;
            if(JSON.stringify(input.pdfOptions)!==JSON.stringify(options()))throw Error('Options changed. Prepare the PDF again.');
            active.result=result;find('save').hidden=false;find('preview').hidden=false;status.textContent='Ready: '+result.pages+' pages. Save the PDF or open it to print.';
          }catch(error){if(active?.token===token){status.textContent=error.message;if(/filename/i.test(error.message))name.setAttribute('aria-invalid','true');}}
          finally{if(active?.token===token)find('prepare').disabled=false;}
        };
        async function deliver(method){
          if(!valid()||!active.result||find('save').disabled)return;
          try{
            const filename=PS7Logic.filename(name.value);name.removeAttribute('aria-invalid');find('save').disabled=true;find('preview').disabled=true;
            const message=await api[method]({...active.result,filename});if(active?.token===token)status.textContent=message;
          }catch(error){if(active?.token===token)status.textContent=error.name==='AbortError'?'Cancelled. Your PDF is ready when you need it.':error.message;}
          finally{if(active?.token===token){find('save').disabled=false;find('preview').disabled=false;}}
        }
        find('save').onclick=()=>deliver('save');find('preview').onclick=()=>deliver('preview');
        document.body.append(dialog);dialog.querySelectorAll('button').forEach(b=>b.style.minHeight='44px');dialog.showModal();name.focus();name.select();return true;
      }catch(error){close();setStatus('PDF export failed: '+error.message);return false;}
    };
    if(api.enabled()){
      // UI hook: the app menu's Print action uses the same template export dialog.
      document.addEventListener('click',event=>{
        if(!event.target.closest?.('#btnPrint'))return;
        event.preventDefault();event.stopImmediatePropagation();
        if(typeof MODES128 === 'object' && MODES128?.close) MODES128.close();
        api.open(currentId);
      },true);
    }
    return api;
  })();
