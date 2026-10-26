  // BUGFIX PF7: paint values into original field rectangles, remove widgets, then merge static pages.
  const PF7Writer = (() => {
    const bytes=base64=>Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
    function wrap(text,font,size,width){
      const lines=[];
      for(const paragraph of text.split('\n')){
        let line='';
        for(const word of paragraph.split(/(\s+)/)){
          if(font.widthOfTextAtSize(line+word,size)<=width){line+=word;continue;}
          if(line.trim())lines.push(line.trimEnd());line='';
          for(const ch of word){if(font.widthOfTextAtSize(line+ch,size)>width&&line){lines.push(line.trimEnd());line='';}line+=ch;}
        }
        lines.push(line.trimEnd());
      }
      return lines;
    }
    async function generate(snapshot){
      const {PDFDocument,PDFName,rgb}=PX7Dependencies.pdf(),fontkit=PX7Dependencies.fontkit();
      const plan=PF7Logic.plan(snapshot), output=await PDFDocument.create(), extra=plan.extra.slice();
      output.registerFontkit(fontkit);
      const font=await output.embedFont(bytes(PX7Assets.font),{subset:true});
      const supported=new Set(font.getCharacterSet());
      function clean(value){
        const text=PX7Logic.text(value);
        const bad=[...new Set([...text].filter(c=>c!=='\n'&&!supported.has(c.codePointAt(0))))];
        if(bad.length)throw Error('The PDF font cannot print '+bad.slice(0,8).map(c=>'U+'+c.codePointAt(0).toString(16).toUpperCase()).join(', ')+'. No PDF was downloaded.');
        return text;
      }
      for(const section of plan.pages){
        const asset=PX7Assets.templates[section.template];
        if(!asset)throw Error('Unknown PDF template: '+section.template);
        const source=await PDFDocument.load(bytes(asset.pdf));
        source.getPages().forEach(p=>p.node.delete(PDFName.of('Annots')));
        source.catalog.delete(PDFName.of('AcroForm'));
        const pages=await output.copyPages(source,source.getPageIndices());pages.forEach(p=>output.addPage(p));
        // Redraw the damaged Bushi background as clean vectors at the original field positions.
        const rules=PF7Logic.lineFields(section.template,asset.fields);
        if(section.template==='bushi'){
          const page=pages[0];page.drawRectangle({x:30,y:40,width:540,height:750,color:rgb(1,1,1)});
          const label=(text,x,y,size=6)=>page.drawText(text,{x,y,size,font,color:rgb(0,0,0)});
          const heading=(text,x,y,width)=>{page.drawRectangle({x,y,width,height:17,color:rgb(0,0,0)});page.drawText(text,{x:x+(width-font.widthOfTextAtSize(text,9))/2,y:y+4,size:9,font,color:rgb(1,1,1)});};
          heading('Bushi School Techniques',34,775,351);heading('Notes',397,775,168);heading('Kata',34,265,531);
          for(const field of asset.fields){
            const [x,y,r,t]=field.rect;
            if(field.name.startsWith('BUSHI_SCHOOL_NM'))label('School',x-21,y+2);
            if(/^BUSHI_TECH\./.test(field.name)){
              const rank=Number(field.name.split('.')[1])+1;
              page.drawCircle({x:x-28,y:y+5,size:4.3,borderColor:rgb(.45,.45,.45),borderWidth:.6});label('Rank '+rank,x-22,y+2);
            }
            if(/^(?:BUSHI_TECH_TEXT|KATA_TEXT)\./.test(field.name)){
              label('Effect',x,t+2);page.drawLine({start:{x:x+21,y:t+1},end:{x:r,y:t+1},thickness:.45,color:rgb(0,0,0)});
            }
            if(field.name.startsWith('KATA_NM'))label('Name',x-18,y+2);
            if(field.name.startsWith('KATA_RING_MA'))label('Ring / Mastery',x-44,y+2,5.3);
            if(field.name.startsWith('KATA_DURATION'))label('Duration',x-27,y+2,5.3);
          }
        }
        for(const field of rules){const [x,y,r]=field.rect;pages[field.page].drawLine({start:{x,y:y-0.5},end:{x:r,y:y-0.5},thickness:0.45,color:rgb(0,0,0)});}
        if(section.template==='all'){
          pages[0].drawRectangle({x:411,y:269,width:150,height:9,color:rgb(0,0,0)});
          pages[0].drawText('Healthy: Earth x5; each later level: Earth x'+plan.woundMultiplier,{x:414,y:271,size:5.2,font,color:rgb(1,1,1)});
        }
        if(section.template==='all'||section.template==='skill'){
          pages[0].drawText('Traits: Aware = Awareness; Ref = Reflexes; Perc = Perception; Int = Intelligence; Will = Willpower; Sta = Stamina; Str = Strength; Agi = Agility.',{x:34,y:26,size:5.8,font,color:rgb(0,0,0)});
        }
        const byName=new Map(asset.fields.map(field=>[field.name,field]));
        for(const [key,value] of Object.entries(section.values)){
          const field=byName.get(key);
          if(!field)throw Error('PDF field is missing: '+section.template+'/'+key);
          if(value===false||value===undefined||value===null||value==='')continue;
          const [x,y,right,top]=field.rect, w=right-x-3,h=top-y-2,page=pages[field.page];
          if(typeof value==='boolean'){page.drawCircle({x:(x+right)/2,y:(y+top)/2,size:Math.max(1,Math.min(w,h)/3),color:rgb(0,0,0)});continue;}
          let text=clean(value),size=Math.min(field.size || 10,h/1.2),lines=[],fits=false;
          const minimum=Math.min(6,size);
          for(;;){
            lines=wrap(text,font,size,w);fits=lines.length*size*1.2<=h+0.01;
            if(fits||size===minimum)break;
            size=Math.max(minimum,size-0.5);
          }
          if(!fits){
            const ref=extra.length+1;extra.push({label:PF7Logic.label(key),text});
            text='['+ref+']';size=Math.min(8,h/1.2);lines=[text];
            while(size>3&&font.widthOfTextAtSize(text,size)>w)size-=0.5;
          }
          lines.forEach((line,i)=>{
            const width=font.widthOfTextAtSize(line,size),left=field.align===1?(x+right-width)/2:field.align===2?right-width-1.5:x+1.5;
            const baseline=lines.length===1?(rules.includes(field)?y+2:(y+top)/2-size*0.35):top-1-size-i*size*1.2;
            page.drawText(line,{x:left,y:baseline,size,font,color:rgb(0,0,0)});
          });
        }
        await new Promise(resolve=>setTimeout(resolve,0));
      }
      if(extra.length){
        let page,y;
        const next=()=>{page=output.addPage([595.2,841.92]);y=770;page.drawText('Character details',{x:36,y:807,font,size:14});page.drawText(wrap(clean(plan.name),font,9,523)[0],{x:36,y:790,font,size:9});};
        next();
        for(let i=0;i<extra.length;i++){
          const item=extra[i],lines=wrap(clean('['+(i+1)+'] '+item.label+'\n'+item.text),font,10,523);
          // Keep entries that fit a page together; keep a long entry's heading with its first line.
          const needed=Math.min(lines.length,Math.floor((770-42)/13)+1);
          if(y-13*(needed-1)<42)next();
          for(const line of lines){if(y<42)next();page.drawText(line,{x:36,y,font,size:10});y-=13;}
          y-=10;
        }
      }
      output.getPages().forEach(page=>page.node.delete(PDFName.of('Annots')));
      output.catalog.delete(PDFName.of('AcroForm'));
      output.setTitle(plan.name+' - L5R character sheet');output.setCreator('L5R Character Sheet Creator');
      return {bytes:await output.save(),filename:PX7Logic.filename(plan.name),pages:output.getPageCount()};
    }
    return {generate,wrap,enabled:()=>PDF_LAYOUT_REFINEMENTS_ENABLED};
  })();
