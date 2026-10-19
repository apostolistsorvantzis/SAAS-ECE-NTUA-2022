const { GenerationpPerType } = require(appRoot + '/GPTdb/gptdb');

function dataRequest(ws, msg) {
  // Find diffent types of production types for specific country
  GenerationpPerType.find().distinct('production_type',
    {
      map_code: {
        $in: msg.countries,
      },
      date_time: {
        $gte: new Date(msg.start_date),
        $lte: new Date(msg.end_date),
      }
    } 
  ).then((types) => {
    GenerationpPerType.find({
      map_code: {
        $in: msg.countries,
      },
      production_type: {
        $in: msg.prod_type,
      },
      date_time: {
        $gte: new Date(msg.start_date),
        $lte: new Date(msg.end_date),
      },
    }).then((result) => {
      const renderData = [];
      for (let i = 0; i < msg.prod_type.length; i++) {
        const pt = msg.prod_type[i];
        const typeData = result.filter((d) => d.production_type === pt);
        const typeMapped = typeData.map((d) => {
          return [d.date_time, d.gpt_value];
        });
        renderData.push({
          countries: msg.countries,
          name: pt,
          data: typeMapped,
        });
      }
      ws.send(
        JSON.stringify({
          type: 'GPT',
          data: renderData,
          types
        }),
        );
      });
    });
    
    
    
    
  }
  
  module.exports = dataRequest;