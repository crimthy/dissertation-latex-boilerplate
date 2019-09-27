const readline = require('readline');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const BibTypes = require('./plugins/types');
const { BookDetails, SiteDetails } = require('./plugins/types-structures');
const PluginsManager = require('./PluginsManager')
const { Indicators, Colors, defaultBackgroundTextStyles } = require('./plugins/utils');
const program = require('commander');

const omit = (obj, omitKeys) => {
    return Object.keys(obj).reduce((result, key) => {
      if(omitKeys.includes(key)) {
         result[key] = obj[key];
      }
      return result;
    }, {});
}

const omitByPluginsList = (list) => {
    plugins = omit(plugins, list);
}


const saveToFile = (str, fileName) => {

}

const buildPlaneText = (arr) => {
    console.log(arr.length)
}

const buildLatexBibTemplate = (arr) => {

}

function exit() {
    process.exit(1);
}

 
const defaultCount = 10;

program
  .option('-c, --count <countOfResults>', 'Count of results for single query request. By default: 10')
  .option('-q --query <query>', `Query, which consists of keywords that are worth looking for, words are listed with a space, for phrases, spaces should be replaced with underscore, for example: "javascript how_node_js_is_work"`)
  .option('--using-plugins <pluginsString>', `List of required plugins names listed with a space, for example: "OReilly DuckDuckGo", if not provided, use all plugins by default`, omitByPluginsList)
  .option('--format-to-bibtex', 'Format output result to bibtex template')
  .option('--books-count <booksCount>', `Specify a count of results for book type per each single query request, '--sites-count' parameter required`)
  .option('--sites-count <sitesCount>', `Specify a count of results for site type per each single query request, '--books-count' parameter required`)
  .option('--books-query <booksQuery>', `Specify a query for book type, '--sites-query' param required`)
  .option('--sites-query <sitesQuery>', `Specify a query for site type, '--books-query' param required`)
  

program.parse(process.argv);


if (program.query && (program.sitesQuery || program.booksQuery)) { console.log(`${Indicators.Error} Only 'query' or ('books-query' && 'sites-query') in the same time`); exit(); }

if (!program.query){
    switch(true) {
        case (!program.sitesQuery && !program.booksQuery):
            console.log(`${Indicators.Error} 'query' or ('books-query' && 'sites-query') parameters required`); exit();
        case (!program.sitesQuery || !program.booksQuery):
            console.log(`${Indicators.Error} Both'books-query' and 'sites-query' parameters required`); exit();
    }
}

if (program.count && (program.sitesCount || program.booksCount)) { console.log(`${Indicators.Error} Only 'count' or ('books-count' && 'sites-count') in the same time`); exit(); }
if (!program.count && (!program.sitesCount || !program.booksCount)) { console.log(`${Indicators.Error} Both'books-count' and 'sites-count' parameters required (or 'count' for all)`); exit(); }


console.log(`${Indicators.Info} Loading available plugins...`);

let plugins = new PluginsManager().exports;
let pluginNames = Object.keys(plugins);
console.log(`${Indicators.Ok} Loaded ${defaultBackgroundTextStyles.txtBgRed(pluginNames.length)} plugins: [${pluginNames.join(', ')}]`);


Object.keys(plugins).forEach(pluginName => {
    const pluginType = plugins[pluginName].type();
    const usageQuery = !(program.query) ? 
        pluginType === BibTypes.book.type ? 
            program.booksQuery : program.sitesQuery
            : program.query;
    const usageCount = !(program.count) ?
        program.count ? program.count :
            pluginType === BibTypes.book.type ?
                program.booksCount : program.sitesCount
        : defaultCount;
    let pluginInstance = new plugins[pluginName](usageQuery, usageCount);
    pluginInstance.parse().then(result => {
        program.formatToBibtex ? buildLatexBibTemplate(result) : buildPlaneText(result);
    })
})
console.log("here")
