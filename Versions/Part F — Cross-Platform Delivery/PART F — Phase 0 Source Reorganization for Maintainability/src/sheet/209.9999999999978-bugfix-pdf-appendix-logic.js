  // BUGFIX PDA7: optional descriptive appendix policy, independent of the UI.
  const PDF_DETAILS_APPENDIX_ENABLED = true;
  const PDA7Logic = (()=>{
    function amend(plan,snapshot){
      const optional=new Map();
      for(const kind of ['adv','disadv'])for(const row of snapshot[kind].slice(0,17))if(row.desc){const key=(kind==='adv'?'ADVANTAGE':'DISADVANTAGE')+': '+row.name;optional.set(key,(optional.get(key)||0)+1);}
      const details=[],required=[];
      for(const item of plan.extra){
        if((optional.get(item.label)||0)>0){details.push(item);optional.set(item.label,optional.get(item.label)-1);}
        else if(/^(Kata|Kiho): /.test(item.label))details.push(item);else required.push(item);
      }
      plan.extra=required;
      plan.appendix=snapshot.pdfOptions?.includeDetails===false?[]:details;
      return plan;
    }
    return {amend,enabled:()=>PDF_DETAILS_APPENDIX_ENABLED};
  })();
