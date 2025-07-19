AddEventHandler("playerSpawned", function()
    ShutdownLoadingScreen()
    ShutdownLoadingScreenNui()
end)

RegisterNUICallback("openLink", function(data, cb)
    if data.url then
        SetNuiFocus(false, false)
        SetCursorLocation(0.5, 0.5)
        SetClipboard(data.url)
        BeginTextCommandLine("OPEN_URL")
        AddTextComponentString(data.url)
        EndTextCommandLine()
    end
    cb({})
end)
