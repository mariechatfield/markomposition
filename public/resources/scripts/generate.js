define([
    'app.config'
], function (Config) {

    'use strict';

    var DEBUG = false,
        WHITESPACE,
        words,
        model,
        chainLevel;

    var addWhitespace = function (string, frequency)
    {
        var i;

        for (i = 0; i < frequency; i++)
        {
            WHITESPACE.push(string);
        }
    };

    var randomChoice = function (array)
    {
        return array[Math.floor(Math.random()*array.length)];
    };

    var getTuple = function (index)
    {
        var tuple = [],
            i;

        for (i = 0; i < chainLevel; i++)
        {
            tuple.push(words[index + i]);
        }

        return tuple;
    };

    var makeNextTuple = function (currentTuple)
    {
        var tuple = [],
            i;

        for (i = 1; i < chainLevel; i++)
        {
            tuple.push(currentTuple[i]);
        }

        tuple.push(randomChoice(model[currentTuple].nextWords));

        return tuple;
    };

    var setUpWhitespace = function (enjambmentLevel)
    {
        WHITESPACE = [];

        switch (enjambmentLevel)
        {
            case 'most':
            {
                addWhitespace('&#160;', 50);
                addWhitespace('&#160;&#160;', 25);
                addWhitespace('&#160;&#160;&#160;&#160;&#160;', 25);
                addWhitespace('<br>', 20);
                addWhitespace('<br><br>', 20);
                addWhitespace('<br>&#160;', 20);
                addWhitespace('<br>&#160;&#160;', 20);
                addWhitespace('<br>&#160;&#160;&#160;&#160;', 20);
                break;
            }

            case 'medium':
            {
                addWhitespace('&#160;', 100);
                addWhitespace('&#160;&#160;', 25);
                addWhitespace('<br>', 25);
                addWhitespace('<br>&#160;', 25);
                addWhitespace('<br>&#160;&#160;', 25);
                break;
            }

            default:
            {
                addWhitespace('&#160;', 175);
                addWhitespace('<br>', 25);
                break;
            }
        }

    };

    return function () {

        var text = Config.textInput.val(),
            numWords = parseInt(Config.numWordsInput.val()),
            enjambmentLevel = $('input[name="enjambmentInput"]:checked').val(),
            allTuples = [],
            currentTuple,
            poem,
            i;
        
        text.replace('\n', '<br>');
        text.replace('\t', '&#160;&#160;&#160;&#160;');

        words = text.split(' ');
        model = {};
        chainLevel = parseInt($('input[name="chainInput"]:checked').val());

        setUpWhitespace(enjambmentLevel);

        if (DEBUG) 
        { 
            console.log('Words: ', words);
            console.log('Chain Length: ', chainLevel);
            console.log('numWords: ', numWords);
        }

        /* Build the Markov model. */
        for (i = 0; i < words.length - chainLevel; i++)
        {
            var tuple = getTuple(i);

            if (model[tuple] === undefined)
            {
                model[tuple] = {tuple: tuple, 
                                nextWords:[]};
            }

            model[tuple].nextWords.push(words[i + chainLevel]);
        }

        if (DEBUG) 
        {
            console.log('Model: ', model);
        }

        /* Build the poem from the model. */

        for (var t in model)
        {
            if (model.hasOwnProperty(t) && model[t].tuple !== undefined)
            {
                allTuples.push(model[t].tuple);
            }
        }

        if (DEBUG)
        {
            console.log('allTuples: ', allTuples);   
        }

        currentTuple = randomChoice(allTuples);
        
        poem = currentTuple[0];

        if (DEBUG)
        {
            console.log(currentTuple);
        }

        for (i = 1; i < currentTuple.length; i++)
        {
            poem += randomChoice(WHITESPACE) + currentTuple[i];
        }

        if (DEBUG) {
            console.log('Poem (begin): ', poem);   
        }

        for (i = 0; i < numWords - chainLevel; i++)
        {
            if (model[currentTuple] === undefined)
            {
                break;
            }

            var nextTuple = makeNextTuple(currentTuple);
            poem += randomChoice(WHITESPACE) + nextTuple[chainLevel - 1];
            currentTuple = nextTuple;
        }

        if (DEBUG) 
        {
            console.log('Poem: ', poem);
        }

        Config.poem.html(poem);

    };

});