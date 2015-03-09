define('generate', [
    'app.config',
    'util'
], function (Config, Util) {

    'use strict';

    var Generate = {},
        DEBUG = false,
        WHITESPACE,
        words,
        model,
        chainLevel,
        currentTuple,
        poem,
        syllablesLeft;

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

    Generate.generate = function () 
    {
        $('#feedbackPoem').show();

        if (false)
        {
            Generate.freeVerse();
        }
        else
        {
            Generate.haiku();
        }

        $('#feedbackPoem').hide();

    };

    var makeNextTuple = function (currentTuple)
    {
        return currentTuple.slice(1, chainLevel)
                           .concat(randomChoice(model[currentTuple].nextWords));
    };

    Generate.freeVerse = function () {

        var text = Config.textInput.val(),
            numWords = parseInt(Config.numWordsInput.val()),
            enjambmentLevel = $('input[name="enjambmentInput"]:checked').val(),
            allTuples = [],
            i;
        
        text.replace('\n', '<br>');
        text.replace('\t', '&#160;&#160;&#160;&#160;');

        words = text.split(/\s+/);
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

    var makeAllNextTuples = function (currentTuple, maxSyllables)
    {
        var tuples = [],
            nextWords,
            i, j;

        if (model[currentTuple] === undefined) 
        {
            return tuples;
        }

        nextWords = model[currentTuple].nextWords;

        for (i in nextWords)
        {
            var potentialWord = nextWords[i],
                numSyllables = Util.getSyllableWord(potentialWord);

            if (numSyllables > maxSyllables || numSyllables === -1)
            {
                continue;
            }

            tuples.push(currentTuple.slice(1, chainLevel)
                                    .concat(potentialWord));
        }

        return tuples;
    };

    var completeLine = function ()
    {
        var nextTuple,
            nextWord,
            allNextTuples;

        while (syllablesLeft > 0)
        {
            allNextTuples = makeAllNextTuples(currentTuple, syllablesLeft);

            if (allNextTuples.length === 0)
            {
                return -1;
            }
            else 
            {
                nextTuple = randomChoice(allNextTuples);
                nextWord = nextTuple[chainLevel - 1];
                poem += ' ' + nextWord;
                syllablesLeft -= Util.getSyllableWord(nextWord);

                currentTuple = nextTuple;
            }
        }

        return 0;
    };

    Generate.haiku = function ()
    {
        var text = Config.textInput.val(),
            allTuples = [],
            MIN_SYLLABLES = 5,
            MAX_SYLLABLES = 7,
            ATTEMPTS_PER_HAIKU = 50,
            attempt,
            numHaikuRequested,
            numHaikuCreated = 0,
            i, j;

        var errorMessage = '<h3 class="text-danger">Uh-oh... couldn\'t create' +
                            ' a haiku. Try again!</h3>';
        
        Config.poem.html('');

        text.replace('\n', '<br>');
        text.replace('\t', '&#160;&#160;&#160;&#160;');

        words = text.split(/\s+/);
        model = {};
        chainLevel = parseInt($('input[name="chainInput"]:checked').val());
        numHaikuRequested = parseInt($('#numHaikuInput').val());

        if (DEBUG) 
        { 
            console.log('Words: ', words);
            console.log('Chain Length: ', chainLevel);
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

            var nextWord = words[i + chainLevel],
                syllables = Util.getSyllableWord(nextWord);

            if (syllables >= 0) {
                model[tuple].nextWords.push(nextWord);   
            }
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

        attemptLoop:
        for (attempt = 0; attempt < ATTEMPTS_PER_HAIKU * numHaikuRequested; 
             attempt++)
        {
            if (DEBUG)
            {
                console.debug('attempt: ' + attempt);
            }

            currentTuple = randomChoice(allTuples);   
            if (Util.getSyllableTuple(currentTuple) > MIN_SYLLABLES)
            {
                if (DEBUG)
                {
                    console.debug('first tuple too long');   
                }
                continue;
            }
            
            poem = currentTuple[0];

            syllablesLeft = MIN_SYLLABLES - Util.getSyllableTuple(currentTuple);

            if (DEBUG)
            {
                console.log(currentTuple);
            }

            for (i = 1; i < currentTuple.length; i++)
            {
                poem += ' ' + currentTuple[i];
            }

            if (DEBUG) {
                console.log('Poem (begin): ', poem);   
            }

            if (completeLine(currentTuple) === -1)
            {
                if (DEBUG)
                {
                    console.debug('no options on first line');
                }
                continue;
            }

            poem += '<br>';
            syllablesLeft = MAX_SYLLABLES;

            if (completeLine(currentTuple) === -1)
            {
                if (DEBUG)
                {
                    console.debug('no options on second line');
                }
                continue;
            }

            poem += '<br>';
            syllablesLeft = MIN_SYLLABLES;

            if (completeLine(currentTuple) === -1)
            {
                if (DEBUG)
                {
                    console.debug('no options on third line');
                }
                continue;
            }

            poem += '<br><br>';

            Config.poem.append(poem);
            numHaikuCreated++;

            if (numHaikuCreated === numHaikuRequested)
            {
                return;
            }

        }

        if (numHaikuCreated === 0)
        {
            Config.poem.html(errorMessage);   
        }
    };

    return Generate.generate;

});