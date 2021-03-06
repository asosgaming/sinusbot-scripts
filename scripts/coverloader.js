// @ts-check
registerPlugin({
    name: 'Album Art',
    version: '1.0.0',
    backends: ['ts3'],
    description: 'Changes Sinusbots Avatar to the Album cover for the currently playing track. This Plugin utilizes the public API from api.deezer.com',
    author: 'Reesey275 <reesey275@asosgaming.com>',
    vars: [{
        name: 'setLocalTracksCoverArt',
        title: 'In addition to streams, do you want to set the cover art of local saved tracks?',
        type: 'select',
        options: ['No','Yes']
    },
    {
        name: 'updateLocalTracksCoverArt',
        title: 'If you enabled the option above, do you want to update the cover art if they changed?',
        type: 'select',
        options: ['No','Yes']
    },
    {
        name: 'setAsAvatar',
        title: 'Do you want to set the downloaded cover art as avatar? (If "No", Covatar won\'t set the updated cover art)',
        type: 'select',
        options: ['No','Yes']
    }]
}, function(sinusbot, config) {
    // import modules
    var engine = require("engine");
    var event = require("event");
    var ws = require('ws');
    var backend = require('backend');
    var api = "http://api.deezer.com/search?q=";

    event.on('track', function(ev) {
        if (ev.type == '' || ev.type == 'track') {
            if (config.setLocalTracksCoverArt) {
                if (!ev.thumbnail || config.updateLocalTracksCoverArt) {
                    if (ev.title != '' && ev.artist != '') {
                        var searchString = ev.artist.split(' feat.')[0] + ' - ' + ev.title.replace(new RegExp('`', 'g'), "'").replace(new RegExp('´', 'g'), "'");
                        engine.log('Searching cover art for ' + ev.artist + ' - ' + ev.title + ' ...');
                        sinusbot.http({
                            method: 'GET',
                            url: api + encodeURIComponent(searchString) + '&limit=1',
                            timeout: 30000
                        }, function(error, response) {
                            if (typeof response != 'undefined' && response.statusCode == 200) {
                                var sres = JSON.parse(response.data);
                                if (sres && sres.data && sres.data.length > 0) {
                                    var track = sres.data[0];
                                    if (track.album && track.album.cover_big) {
                                        if (sinusbot.downloadTrackThumbnail(ev.uuid, track.album.cover_big.substr(0, track.album.cover_big.lastIndexOf(".")) + ".png")) {
                                            if (config.setAsAvatar) {
                                                if (!sinusbot.setAvatarFromTrack()) {
                                                    sinusbot.setDefaultAvatar();
                                                }
                                            }
                                            engine.log('Updated cover art!');
                                        } else {
                                            engine.log("Couldn't set cover art!");
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }
    });
    
    event.on('trackInfo', function(ev) {
        if (ev.type == 'url') {
            if (ev.tempTitle != '' && ev.tempArtist != '') {
                var searchString = ev.tempArtist.replace(new RegExp('`', 'g'), "'").replace(new RegExp('´', 'g'), "'").replace(/ ?((\[|\().*feat\. ?.*(\]|\)))|( ?feat\..*)/g, '') + ' - ' + ev.tempTitle.replace(new RegExp('`', 'g'), "'").replace(new RegExp('´', 'g'), "'").replace(/ ?((\[|\().*feat\. ?.*(\]|\)))|( ?feat\..*)/g, '');
                engine.log('Searching cover art for ' + ev.tempArtist + ' - ' + ev.tempTitle + ' ...');
                sinusbot.http({
                    method: 'GET',
                    url: api + encodeURIComponent(searchString) + '&limit=1',
                    timeout: 30000
                }, function(error, response) {
                    if (typeof response != 'undefined' && response.statusCode == 200) {
                        var sres = JSON.parse(response.data);
                        if (sres && sres.data && sres.data.length > 0) {
                            var track = sres.data[0];
                            if (track.album && track.album.cover_big) {
                                if (sinusbot.downloadTrackThumbnail(ev.uuid, track.album.cover_big.substr(0, track.album.cover_big.lastIndexOf(".")) + ".png")) {
                                    if (config.setAsAvatar) {
                                        if (!sinusbot.setAvatarFromTrack()) {
                                            sinusbot.setDefaultAvatar();
                                        }
                                    }
                                    engine.log('Updated cover art!');
                                } else {
                                    engine.log("Couldn't set cover art!");
                                }
                            }
                        }
                    }
                });
            }
        }
    });
});
