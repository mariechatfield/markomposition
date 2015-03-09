define('generate', [
    'app.config',
    'util'
], function (Config, Util) {

    'use strict';

    var Generate = {},
        DEBUG = false;

    Generate.generate = function () 
    {
        $('#feedbackPoem').show();

        var context = {},
            text = Config.textInput.val();

        text.replace('\n', '<br>');
        text.replace('\t', '&#160;&#160;&#160;&#160;');

        context.words = text.split(/\s+/);
        context.model = {};

        context.chainLevel = parseInt($('input[name="chainInput"]:checked')
                                      .val());

        if ($('#freeVerseTab').hasClass('active'))
        {
            Generate.freeVerse(context);
        }
        else if ($('#haikuTab').hasClass('active'))
        {
            Generate.haiku(context);
        }

        $('#feedbackPoem').hide();

    };

    Generate.freeVerse = function (context) {

        var allTuples = [],
            i;

        context.numWords = parseInt(Config.numWordsInput.val());
        context.enjambmentLevel = $('input[name="enjambmentInput"]:checked')
                                    .val();

        Util.setUpWhitespace(context);

        if (DEBUG) 
        { 
            console.log('Words: ', context.words);
            console.log('Chain Length: ', context.chainLevel);
            console.log('numWords: ', context.numWords);
        }

        /* Build the Markov model. */
        for (i = 0; i < context.words.length - context.chainLevel; i++)
        {
            var tuple = Util.getTuple(context, i);

            if (context.model[tuple] === undefined)
            {
                context.model[tuple] = {tuple: tuple, 
                                nextWords:[]};
            }

            context.model[tuple].nextWords
                .push(context.words[i + context.chainLevel]);
        }

        if (DEBUG) 
        {
            console.log('Model: ', context.model);
        }

        /* Build the poem from the model. */

        for (var t in context.model)
        {
            if (context.model.hasOwnProperty(t) && 
                context.model[t].tuple !== undefined)
            {
                allTuples.push(context.model[t].tuple);
            }
        }

        if (DEBUG)
        {
            console.log('allTuples: ', allTuples);   
        }

        context.currentTuple = Util.randomChoice(allTuples);
        
        context.poem = context.currentTuple[0];

        if (DEBUG)
        {
            console.log(context.currentTuple);
        }

        for (i = 1; i < context.currentTuple.length; i++)
        {
            context.poem += Util.randomChoice(context.WHITESPACE) + 
                            context.currentTuple[i];
        }

        if (DEBUG) 
        {
            console.log('Poem (begin): ', context.poem);   
        }

        for (i = 0; i < context.numWords - context.chainLevel; i++)
        {
            if (context.model[context.currentTuple] === undefined)
            {
                break;
            }

            var nextTuple = Util.makeNextTuple(context);
            context.poem += Util.randomChoice(context.WHITESPACE) + 
                            nextTuple[context.chainLevel - 1];
            context.currentTuple = nextTuple;
        }

        if (DEBUG) 
        {
            console.log('Poem: ', context.poem);
        }

        Config.poem.html(context.poem);

    };

    Generate.haiku = function (context)
    {
        var allTuples = [],
            MIN_SYLLABLES = 5,
            MAX_SYLLABLES = 7,
            ATTEMPTS_PER_HAIKU = 50,
            attempt,
            numHaikuRequested,
            numHaikuCreated = 0,
            i, j;

        context.MAX_SYLLABLES = 7;

        numHaikuRequested = parseInt($('#numHaikuInput').val());
        Config.poem.html('');

        if (DEBUG) 
        { 
            console.log('Words: ', context.words);
            console.log('Chain Length: ', context.chainLevel);
        }

        /* Build the Markov model. */
        for (i = 0; i < context.words.length - context.chainLevel; i++)
        {
            var tuple = Util.getTuple(context, i);

            if (context.model[tuple] === undefined)
            {
                context.model[tuple] = {tuple: tuple, 
                                        nextWords:[]};
            }

            var nextWord = context.words[i + context.chainLevel],
                syllables = Util.getSyllableWord(nextWord);

            if (syllables >= 0) {
                context.model[tuple].nextWords.push(nextWord);   
            }
        }

        if (DEBUG) 
        {
            console.log('Model: ', context.model);
        }

        /* Build the poem from the model. */

        for (var t in context.model)
        {
            if (context.model.hasOwnProperty(t) && 
                context.model[t].tuple !== undefined)
            {
                allTuples.push(context.model[t].tuple);
            }
        }

        if (DEBUG)
        {
            console.log('allTuples: ', allTuples);   
        }

        for (attempt = 0; 
             attempt < ATTEMPTS_PER_HAIKU * numHaikuRequested; 
             attempt++)
        {
            if (DEBUG)
            {
                console.debug('attempt: ' + attempt);
            }

            context.currentTuple = Util.randomChoice(allTuples);   
            if (Util.getSyllableTuple(context.currentTuple) > MIN_SYLLABLES)
            {
                if (DEBUG)
                {
                    console.debug('first tuple too long');   
                }
                continue;
            }
            
            context.poem = context.currentTuple[0];

            context.syllablesLeft = MIN_SYLLABLES - 
                                    Util.getSyllableTuple(context.currentTuple);

            if (DEBUG)
            {
                console.log(context.currentTuple);
            }

            for (i = 1; i < context.currentTuple.length; i++)
            {
                context.poem += ' ' + context.currentTuple[i];
            }

            if (DEBUG) {
                console.log('Poem (begin): ', context.poem);   
            }

            if (Util.completeLine(context) === -1)
            {
                if (DEBUG)
                {
                    console.debug('no options on first line');
                }
                continue;
            }

            context.syllablesLeft = MAX_SYLLABLES;

            if (Util.completeLine(context) === -1)
            {
                if (DEBUG)
                {
                    console.debug('no options on second line');
                }
                continue;
            }

            context.syllablesLeft = MIN_SYLLABLES;

            if (Util.completeLine(context) === -1)
            {
                if (DEBUG)
                {
                    console.debug('no options on third line');
                }
                continue;
            }

            context.poem += '<br>';

            Config.poem.append(context.poem);
            numHaikuCreated++;

            if (numHaikuCreated === numHaikuRequested)
            {
                return;
            }

        }

        if (numHaikuCreated === 0)
        {
            Util.displayError('Uh-oh! Couldn\'t create a poem. Try again!'); 
        }
    };

    return Generate.generate;

});