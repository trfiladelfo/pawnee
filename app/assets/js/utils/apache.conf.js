/**
 * httpd.conf file manager
 */
(function(app)
{

    'use strict';

    var module = {};
    var cached = false;
    var watcherCallback;
    var fileModificationTime = false;

    /**
     * Gets httpd.conf
     * @param callback
     */
    module.getConfiguration = function(callback)
    {
        if (cached !== false)
        {
            callback(cached);
        }
        else
        {
            app.node.exec('cat ' + app.models.apache.confPath, function(error, stdout, stderr)
            {
                app.logActivity(stderr);
                callback(stdout);
            });
        }
    };

    /**
     * Updates httpd.conf & backups if needed
     * @param conf
     */
    module.updateConfiguration = function(conf)
    {
        if (!app.node.fs.existsSync(app.models.apache.backupConfPath))
        {
            _backupConfiguration(function()
            {
                _updateConfiguration(conf);
            });
        }
        else
        {
            _updateConfiguration(conf);
        }
    };

    /**
     * Writes httpd.conf
     * @param conf
     * @private
     */
    var _updateConfiguration = function(conf)
    {
        var tmp_path = app.node.os.tmpdir() + 'PawneeTemp.' + Date.now();
        app.node.exec('cat << "EOF" > ' + tmp_path + "\n" + conf + 'EOF', function(error, stdout, stderr)
        {
            app.logActivity(stderr);
            app.node.exec('sudo mv ' + tmp_path + ' ' + app.models.apache.confPath, function(error, stdout, stderr)
            {
                app.logActivity(stderr);
                if (stderr.search(/[^ \n]/g) !== -1)
                {
                    cached = conf;
                }
            });
        });
    };

    /**
     * Backups httpd.conf
     * @param callback
     */
    var _backupConfiguration = function(callback)
    {
        app.node.exec('sudo cp ' + app.models.apache.confPath + ' ' + app.models.apache.backupConfPath, function(error, stdout, stderr)
        {
            app.logActivity(stderr);
            callback();
        });
    };

    /**
     * Starts watching config file
     * @param callback
     */
    module.watchFile = function(callback)
    {
        watcherCallback = callback;
        _recursiveWatchFile();
    };

    /**
     * Recursively watches config file
     */
    var _recursiveWatchFile = function()
    {
        app.node.exec('stat -f "%Sm" -t "%Y%m%dT%H%M%S" ' + app.models.apache.confPath, function(error, stdout, stderr)
        {
            if (fileModificationTime !== stdout)
            {
                if (fileModificationTime !== false)
                {
                    app.logActivity(app.locale.apache.filechange);
                    watcherCallback();
                }
                fileModificationTime = stdout;
            }
            setTimeout(_recursiveWatchFile, 2000);
        });
    };

    app.utils.apache.conf = module;

})(window.App);