  // BUGFIX PS7: validate a user-selected PDF filename without changing character data.
  const PDF_SAVE_WORKFLOW_ENABLED = true;
  const PS7Logic = (()=>{
    function filename(value){
      const name=String(value??'').trim().normalize('NFC').replace(/\.pdf$/i,'');
      if(!name||/[<>:"/\\|?*\x00-\x1f]/.test(name)||/[. ]$/.test(name)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name))throw Error('Enter a filename without slashes or reserved filename characters.');
      if(name.length>120)throw Error('Keep the filename to 120 characters or fewer.');
      return name+'.pdf';
    }
    return {filename,enabled:()=>PDF_SAVE_WORKFLOW_ENABLED};
  })();
