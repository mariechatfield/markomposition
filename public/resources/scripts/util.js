define('util', [
    'jquery',
    'app.config'
], function ($, Config)
{
    var Util = {};

    Util.stripWord = function (word)
    {
        return word.trim()
                   .replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()\s]/g, '')
                   .toLowerCase();
    };

    Util.getSyllableWord = function (word)
    {
        var wordData = Config.iphodCorpus[Util.stripWord(word)];
        
        if (wordData !== undefined)
        {
            return wordData.numSyllables;
        } 
        else if (Util.stripWord(word) === '')
        {
            return 0;
        }
        else 
        {
            return -1;
        }

    };

    Util.getSyllableTuple = function (tuple)
    {
        var count = 0,
            wordData,
            i;

        for (i = 0; i < tuple.length; i++)
        {
            wordData = Config.iphodCorpus[Util.stripWord(tuple[i])];
            if (wordData !== undefined)
            {
                count += wordData.numSyllables;
            } 
            else if (Util.stripWord(tuple[i]) !== '')
            {
                return -1;
            }
        }

        return count;
    };

    return Util;

});