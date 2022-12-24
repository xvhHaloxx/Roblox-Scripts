if (shared.runBind == nil) then
    shared.runBind = Enum.KeyCode.B;
end

local HttpService = game:GetService("HttpService")
local plr = game:GetService("Players").LocalPlayer
local scriptPath = plr.PlayerGui:WaitForChild("Client")
local UIS = game:GetService("UserInputService")
local ESP = loadstring(game:HttpGet("https://raw.githubusercontent.com/Sw1ndlerScripts/RobloxScripts/main/Esp%20Library/main.lua",true))()

local pieces = {
    ["Pawn"] = "p",
    ["Knight"] = "n",
    ["Bishop"] = "b",
    ["Rook"] = "r",
    ["Queen"] = "q",
    ["King"] = "k"
}

-- Fuck you error logger
if game:GetService("ReplicatedStorage").Connections:FindFirstChild("ReportClientError") then
    game:GetService("ReplicatedStorage").Connections.ReportClientError:Destroy()
    for _,v in pairs(getconnections(game:GetService("ScriptContext").Error)) do
        v:Disable()
    end
end

local client = nil
for _,v in pairs(getreg()) do
    if type(v) == "function" then
        for _, v in pairs(getupvalues(v)) do
            if type(v) == "table" and v.processRound then
                client = v
            end
        end
    end
end
assert(client, "failed to find client")


-- Board from client
function getBoard()
    for _,v in pairs(debug.getupvalues(client.processRound)) do
        if type(v) == "table" and v.tiles then
            return v
        end
    end

    return nil
end

-- Gets client's team (white/black)
function getLocalTeam(board)
    -- Bot match detection
    if board.players[false] == plr and board.players[true] == plr then
        return "w"
    end
    
    for i, v in pairs(board.players) do
        if v == plr then
            -- If the index is true, they are white
            if i then
                return "w"
            else
                return "b"
            end
        end
    end

    return nil
end

function willCauseDesync(board)
    -- Bot match detection
    if board.players[false] == plr and board.players[true] == plr then
        return board.activeTeam == false
    end

    for i,v in pairs(board.players) do
        if v == plr then
            -- If the index is true, they are white
            return not (board.activeTeam == i)
        end
    end
    
    return true
end

-- Converts awful format of board table to a sensible one
function createBoard(board)
    local newBoard = {}
    for _,v in pairs(board.whitePieces) do
        if v and v.position then
            local x, y = v.position[1], v.position[2]
            if not newBoard[x] then
                newBoard[x] = {}
            end
            newBoard[x][y] = string.upper(pieces[v.object.Name])
        end
    end
    for _,v in pairs(board.blackPieces) do
        if v and v.position then
            local x, y = v.position[1], v.position[2]
            if not newBoard[x] then
                newBoard[x] = {}
            end
            newBoard[x][y] = pieces[v.object.Name]
        end
    end

    return newBoard
end

-- Board to FEN encoding
function board2fen(board)
    local result = ""
    local boardPieces = createBoard(board)
    for y = 8, 1, -1 do
        local empty = 0
        for x = 8, 1, -1 do
            if not boardPieces[x] then boardPieces[x] = {} end
            local piece = boardPieces[x][y]
            if piece then
                if empty > 0 then
                    result = result .. tostring(empty)
                    empty = 0
                end
                result = result .. piece
            else
                empty += 1
            end
        end
        if empty > 0 then
            result = result .. tostring(empty)
        end
        if not (y == 1) then
            result = result .. "/"
        end
    end
    result = result .. " " .. getLocalTeam(board)
    return result
end

function getPiece(tile)
    local rayOrigin
    local boardTile = game:GetService("Workspace").Board[tile]

    if boardTile.ClassName == 'Model' then
        rayOrigin = game:GetService("Workspace").Board[tile]['Meshes/tile_a'].Position
    else
        rayOrigin = game:GetService("Workspace").Board[tile].Position
    end
    
    local rayDirection = Vector3.new(0, 10, 0)
    
    local raycastResult = workspace:Raycast(rayOrigin, rayDirection)
    
    if raycastResult ~= nil then
        return raycastResult.Instance.Parent
    end

    return nil
end

function gameInProgress()
    return #game:GetService("Workspace").Board:GetChildren() > 0
end

function playerIsWhite()
    if string.match(plr.PlayerGui.GameStatus.White.Info.Text, plr.DisplayName) then
        return true
    end
    return false
end

function runGame()
    -- Get chess board
    local board = getBoard()
    
    -- Check if we're able to run without desync
    if willCauseDesync(board) then
        return false
    end

    -- Ask engine for result using fen encoded board
    local res = syn.request({
        Url = "http://localhost:3000/api/solve?fen=" .. HttpService:UrlEncode(board2fen(board)),
        Method = "GET"
    })
    local result = res.Body

    -- Ensure result is valid
    if string.len(result) > 4 then
        error(result)
    end

    -- Extrapolate movement from result string
    local chars = {}
    for c in result:gmatch(".") do
        table.insert(chars, c)
    end

    -- Get move positions from table
    local x1 = 9 - (string.byte(chars[1]) - 96)
    local y1 = tonumber(chars[2])
    
    local x2 = 9 - (string.byte(chars[3]) - 96)
    local y2 = tonumber(chars[4])

    local pieceToMove = getPiece(x1 .. "," .. y1)
    local placeToMove = game:GetService("Workspace").Board[x2 .. "," .. y2]


    ESP:addHighlight(pieceToMove, {
        FillColor = Color3.new(0, 1, 0.164705),
        FillTransparency = 0.2,
        OutlineColor = Color3.new(255, 255, 255),
        OutlineTransparency = 0.5
    })
    
    ESP:addHighlight(placeToMove, {
        FillColor = Color3.new(0, 1, 0.164705),
        FillTransparency = 0.2,
        OutlineColor = Color3.new(255, 255, 255),
        OutlineTransparency = 0.5
    })

    if playerIsWhite() then
        repeat
            task.wait()
        until plr.PlayerGui.GameStatus.White.Visible == false or gameInProgress() == false
        ESP:clearEsp()
    else
        repeat
            task.wait()
        until plr.PlayerGui.GameStatus.Black.Visible == false or gameInProgress() == false
        ESP:clearEsp()
    end
    
    return true
end

local running = false

UIS.InputEnded:Connect(function(inputObject, gameProcessed)
    if inputObject.KeyCode == shared.runBind and not gameProcessed then
        if not running then
            running = true
            if runGame() then
                print("Ran AI")
            else
                print("Cannot run AI right now")
            end
        end
    end
    running = false
end)

print('executed')
