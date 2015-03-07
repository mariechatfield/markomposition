require.config({
    baseUrl: '/markomposition/public/resources/scripts',
    paths: {
        'jquery': '/markomposition/public/vendor/jquery.min'
    }
});

/**
 * Set up any global utility methods that will be used in the application.
 */
function setUpUtilities(Config) {
    'use strict';

    // String format, from http://stackoverflow.com/a/4673436
    if (!String.prototype.format) {
        String.prototype.format = function () {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, num) {
                return typeof args[num] !== 'undefined' ?
                    args[num] : match;
            });
        };
    }

    /**
     * Return the current Bootstrap device view.
     * From http://stackoverflow.com/a/15150381
     *
     * @return {string} current Bootstrap device view
     */
    var findBootstrapEnvironment = function findBootstrapEnvironment() {
        var envs = ['xs', 'sm', 'md', 'lg'];

        var $el = $('<div>');
        $el.appendTo($('body'));

        for (var i = envs.length - 1; i >= 0; i--) {
            var env = envs[i];

            $el.addClass('hidden-' + env);
            if ($el.is(':hidden')) {
                $el.remove();
                return env;
            }
        }
    };
}

function loadFile (Config, filename)
{
    $.ajax({
        url: '/markomposition/public/resources/texts/' + filename,
        success: function (data) {
            Config.textInput.val(data);
        }
    });
}

/**
 * Initialize game environment and start the application.
 */
require([
    'jquery',
    'app.config',
    'generate'
], function ($, Config, Generate) {

    'use strict';

    setUpUtilities(Config);

    Config.submitBtn.off('click');
    Config.submitBtn.click(Generate);

    $('#dickinson').click(function ()
    {
        loadFile(Config, 'dickinson.txt');
    });

    $('#dante').click(function ()
    {
        loadFile(Config, 'divine_comedy.txt');
    });

    $('#grimm').click(function ()
    {
        loadFile(Config, 'grimm.txt');
    });

});