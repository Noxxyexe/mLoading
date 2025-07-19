
fx_version('cerulean')
games({ 'gta5' })

client_scripts({
    'client.lua'
});

loadscreen 'ui/index.html'
loadscreen_manual_shutdown "yes"
loadscreen_cursor "yes"

files({
    'ui/index.html',
    'ui/style.css',
    'ui/script.js',
    'ui/img/*.png',
    'ui/img/*.jpg',
    'ui/music/*.mp3',
});
