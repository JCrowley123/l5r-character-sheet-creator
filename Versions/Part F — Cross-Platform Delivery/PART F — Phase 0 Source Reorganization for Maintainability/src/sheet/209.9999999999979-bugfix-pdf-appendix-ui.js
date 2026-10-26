  // BUGFIX PDA7: independently removable appendix renderer and export option.
  const PDA7 = (()=>{
    function mount(parent){
      const label=document.createElement('label');label.className='ap7-option';label.style.cssText='display:block;margin:1rem 0';
      const input=document.createElement('input');input.type='checkbox';input.id='ap7-details';input.checked=false;
      label.append(input,document.createTextNode(' Include details appendix'));
      const hint=document.createElement('small');hint.style.cssText='display:block;margin-top:.4rem';hint.textContent='Adds advantage, disadvantage, kata and kiho descriptions. Character notes and text that does not fit are always included.';
      label.append(hint);parent.append(label);return ()=>({includeDetails:input.checked});
    }
    function append(output,font,clean,wrap,plan){
      if(!plan.appendix?.length)return;
      let page,y;
      function next(){page=output.addPage([595.2,841.92]);y=770;page.drawText('Details appendix',{x:36,y:807,font,size:14});page.drawText(wrap(clean(plan.name),font,9,523)[0],{x:36,y:790,font,size:9});}
      next();
      for(const item of plan.appendix){
        const lines=wrap(clean(item.label+'\n'+item.text),font,10,523),need=Math.min(lines.length,56);
        if(y-13*(need-1)<42)next();
        for(const line of lines){if(y<42)next();page.drawText(line,{x:36,y,font,size:10});y-=13;}y-=10;
      }
    }
    return {mount,append,enabled:()=>PDF_DETAILS_APPENDIX_ENABLED};
  })();
