/**
 * Panel view
 */
(function(app, $)
{

    'use strict';

    var module = function()
    {

        var window = null;
        var $panel = null;
        var events = new app.node.events.EventEmitter();
        var isVisible = false;
        var $ui = {};
        var maxHeight = 0;

        /**
         * Attaches an event
         * @param event
         * @param callback
         */
        this.on = function(event, callback)
        {
            events.on(event, callback);
        };

        /**
         * Show main window & inits events
         */
        this.init = function()
        {
            var window_params =
            {
                toolbar: app.devMode,
                frame: false,
                transparent: true,
                position: 'mouse',
                resizable: false,
                show: false,
                title: ''
            };
            window = app.node.gui.Window.open('templates/panel.html', window_params);
            window.on('document-end', $.proxy(function()
            {
                window.window.onload = $.proxy(_onWindowLoaded, this);
            }, this));
        };

        /**
         * Toggles the view
         * @todo check screen bounds
         * @todo hide on blur
         * @param x
         * @param y
         */
        this.toggle = function(x, y)
        {
            if (!isVisible)
            {
                window.moveTo(x - 250 + 15, y);
                _setWindowSize.apply(this);
                window.show();
                window.focus();
                if (app.devMode)
                {
                    window.showDevTools();
                }
            }
            else
            {
                window.hide();
            }
            isVisible = !isVisible;
        };

        /**
         * Loads the template when the view is ready and tells the controller
         */
        var _onWindowLoaded = function()
        {
            $panel = $(window.window.document.body).find('.js-panel');
            $ui.switcher = $panel.find('.js-switcher');
            $ui.switch = $panel.find('.js-switch');
            $ui.heading = $panel.find('.js-heading');
            app.disableDragDrop($panel);
            $ui.switcher.on('click', $.proxy(_onToggleSwitcher, this));
            $ui.heading.on('click', $.proxy(_onToggleSection, this));
            events.emit('loaded');
            _setWindowSize.apply(this);
        };

        /**
         * Toggles the main switcher
         * @param evt
         */
        var _onToggleSwitcher = function(evt)
        {
            evt.preventDefault();
            $ui.switch.toggleClass('js-off');
        };

        /**
         * Toggles a section
         * @param evt
         */
        var _onToggleSection = function(evt)
        {
            evt.preventDefault();
            var $heading = $(evt.currentTarget);
            _setWindowSize.apply(this, [maxHeight]);
            $heading.closest('.js-section').toggleClass('js-closed').find('.js-content').slideToggle({
                duration: 200,
                easing: 'linear',
                complete: $.proxy(_setWindowSize, this)
            });
        };

        /**
         * Updates the size of the window depending on its content
         * @param height
         * @private
         */
        var _setWindowSize = function(height)
        {
            height = height || $panel.height() + 40;
            window.resizeTo($panel.width() + 40, height);
            if (height > maxHeight)
            {
                maxHeight = height;
            }
        };

    };

    app.views.panel = module;

})(window.App, jQuery);