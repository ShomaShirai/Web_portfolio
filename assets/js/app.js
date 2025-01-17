document.addEventListener('DOMContentLoaded', function() {
    // 変数
    const boardSize = 8;
    let board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
    let currentPlayer = 'black';
    let autoMode = false;

    // ボードの初期化
    function initializeBoard() {
        board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
        board[3][3] = 'black';
        board[3][4] = 'white';
        board[4][3] = 'white';
        board[4][4] = 'black';
        currentPlayer = 'black';
        autoMode = false;
        updateAutoModeStatus();
        updateScores();
        updateTurnIndicator();
        togglePassButton();
        document.querySelector('#pass-message').textContent = '';
        document.querySelector('#result').textContent = '';
        drawBoard();
    }

    const gameBoard = document.querySelector('#game-board');

    // ボードを描画する関数
    function drawBoard() {
        gameBoard.innerHTML = ''; // ボードを一旦クリア
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement('div'); // 新しいセル要素を作成
                cell.className = 'cell'; // セルにクラスを設定
                cell.dataset.row = row; // セルに行番号を設定
                cell.dataset.col = col; // セルに列番号を設定
    
                if (board[row][col]) {
                    const piece = document.createElement('div');
                    piece.className = `piece ${board[row][col]}`;
                    cell.appendChild(piece);
                }
    
                // 駒を置ける場所の強調 (黒のターンのみ)
                if (currentPlayer === 'black' && board[row][col] === null) {
                    const flips = getFlips(row, col, currentPlayer);
                    if (flips.length > 0) {
                        cell.classList.add('highlight'); // 駒を置けるセルにクラスを追加
                    }
                }
    
                // セルクリックイベント
                cell.addEventListener('click', () => handleMove(row, col));
    
                gameBoard.appendChild(cell); // セルをボードに追加
            }
        }
        checkGameOver();
    }
    

    // 駒を置いた際の処理を行う関数
    function handleMove(row, col) {
        if (board[row][col] !== null) return; // 既に駒が置かれている場合は処理を終了

        const flips = getFlips(row, col, currentPlayer); // 指定した位置でひっくり返せる駒を取得

        if (flips.length > 0) { // ひっくり返せる駒がある場合

            board[row][col] = currentPlayer; // 現在のプレイヤーの駒を指定した位置に置く
            flips.forEach(([r, c]) => (board[r][c] = currentPlayer)); // 取得した駒を全てひっくり返す
            passCount = 0; // パスカウントをリセット
            currentPlayer = currentPlayer === 'black' ? 'white' : 'black'; // プレイヤーを交代
            document.getElementById('pass-message').textContent = ''; // パスメッセージをクリア
            updateScores();
            updateTurnIndicator();
            drawBoard(); // ボードを再描画

            if (currentPlayer === 'white' && !autoMode) { // 白プレイヤーかつ自動モードがオフの場合
                setTimeout(computerMove, 500); // 500ミリ秒後にコンピューターの動きを実行
            }
        }
    }

    // 指定した位置に駒を置いたときにひっくり返す駒を取得する関数
    function getFlips(row, col, player) {
        // 8方向の移動を表す配列
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1], // 縦と横の方向
            [-1, -1], [-1, 1], [1, -1], [1, 1] // 斜めの方向
        ];
        const flips = []; // ひっくり返す駒の位置を格納する配列

        // 各方向に対して駒を調べる
        directions.forEach(([dr, dc]) => {
            const line = []; // 一方向に並ぶ相手の駒を一時的に保存する配列
            let r = row + dr; // 次に調べる行
            let c = col + dc; // 次に調べる列

            // ボードの範囲内で駒をチェック
            while (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
                if (board[r][c] === null) break; // 空白のマスなら終了
                if (board[r][c] === player) {
                    // 自分の駒に到達した場合、これまでの駒をひっくり返すリストに追加
                    flips.push(...line);
                    break;
                }
                // 相手の駒を一時保存
                line.push([r, c]);
                r += dr; // 次の行に進む
                c += dc; // 次の列に進む
            }
        });

        return flips; // ひっくり返す駒のリストを返す
    }

    // コンピューターのターンを実行する関数
    function computerMove() {
        let moveMade = false; // 駒を置けたかどうかのフラグ

        // 全てのマスをチェック
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row][col] === null) { // 空白のマスが対象
                    const flips = getFlips(row, col, currentPlayer); // ひっくり返せる駒を取得
                    if (flips.length > 0) { // ひっくり返せる場合
                        board[row][col] = currentPlayer; // 現在の駒を配置
                        flips.forEach(([r, c]) => (board[r][c] = currentPlayer)); // 駒をひっくり返す
                        currentPlayer = currentPlayer === 'black' ? 'white' : 'black'; // プレイヤーを交代
                        moveMade = true; // 駒を置けたフラグを更新
                        document.getElementById('pass-message').textContent = ''; // パスメッセージをクリア
                        updateScores();
                        updateTurnIndicator();
                        drawBoard(); // ボードを再描画

                        if (autoMode) {
                            setTimeout(computerMove, 500); // 自動モードの場合、再帰的に次のターンを実行
                        }
                        return; // 処理を終了
                    }
                }
            }
        }

        // 駒を置けなかった場合（パス）
        if (!moveMade) {
            const playerName = currentPlayer === 'black' ? '黒' : '白'; // 現在のプレイヤー名を取得
            document.getElementById('pass-message').textContent = `${playerName}がパスしました`; // パスメッセージを表示
            currentPlayer = currentPlayer === 'black' ? 'white' : 'black'; // プレイヤーを交代

            if (autoMode) {
                setTimeout(computerMove, 500); // 自動モードの場合、再帰的に次のターンを実行
            }
        }
    }

    let passCount = 0; // 連続パスのカウント

    // パスの処理を行う関数
    function handlePass() {
        const playerName = currentPlayer === 'black' ? '黒' : '白';
        document.getElementById('pass-message').textContent = `${playerName}がパスしました`;
        passCount++; // パスカウントを増加
        computerMove(); // コンピューターの動きを実行

        if (passCount >= 2) { // 連続で両者がパスした場合
            endGame(); // ゲームを終了
            return;
        }

        currentPlayer = currentPlayer === 'black' ? 'white' : 'black'; // プレイヤーを交代
        if (currentPlayer === 'white' && autoMode) { // 自動モードで白プレイヤーの場合
            setTimeout(computerMove, 500);
        }
    }

    // ゲームが終了したかどうかを判定する関数
    function checkGameOver() {
        const flatBoard = board.flat(); // ボードを1次元の配列に変換
        if (!flatBoard.includes(null)) { // 空白のマスがない場合、ゲーム終了
            autoMode = false; // 自動モードをオフにする
            updateAutoModeStatus(); // 自動モードのステータスを更新
            document.getElementById('pass-button').disabled = true; // パスボタンを無効化する

            // 黒と白の駒の数をカウント
            const blackCount = flatBoard.filter(cell => cell === 'black').length;
            const whiteCount = flatBoard.filter(cell => cell === 'white').length;

            // 結果を判定してテキストを作成
            const resultText = blackCount > whiteCount
                ? `黒の勝ち！ ${blackCount} 対 ${whiteCount}` // 黒の勝利
                : whiteCount > blackCount
                ? `白の勝ち！ ${whiteCount} 対 ${blackCount}` // 白の勝利
                : `引き分け！ ${blackCount} 対 ${whiteCount}`; // 引き分け

            // 結果を画面に表示
            document.getElementById('result').textContent = resultText;
        }
    }

    // パスボタンのクリックイベントを設定
    document.querySelector('#pass-button').addEventListener('click', () => {
        handlePass();
        const playerName = currentPlayer === 'black' ? '黒' : '白'; // 現在のプレイヤー名を取得
        document.querySelector('#pass-message').textContent = `${playerName}がパスしました`; // パスメッセージを表示
        currentPlayer = currentPlayer === 'black' ? 'white' : 'black'; // プレイヤーを交代
        if (currentPlayer === 'white') { // 白プレイヤーの場合
            setTimeout(computerMove, 500); // 500ミリ秒後にコンピューターの動きを実行
        }
    });

    // パスボタンの有効/無効を切り替える関数
    function togglePassButton() {
        document.querySelector('#pass-button').disabled = autoMode; // 自動モードがオンの場合はボタンを無効化
    }

    // スコアを更新する関数
    function updateScores() {
        // ボードを1次元配列に変換
        const flatBoard = board.flat();
        // 黒の駒の数を数え、対応する要素に表示
        document.querySelector('#black-score').textContent = flatBoard.filter(cell => cell === 'black').length;
        // 白の駒の数を数え、対応する要素に表示
        document.querySelector('#white-score').textContent = flatBoard.filter(cell => cell === 'white').length;
    }

    // 現在のターンを画面に表示する関数
    function updateTurnIndicator() {
        // 現在のプレイヤーに応じて「黒」または「白」を取得
        const playerName = currentPlayer === 'black' ? '黒' : '白';
        // 現在のターンを表示エリアに更新
        document.getElementById('turn-indicator').textContent = `現在のターン: ${playerName}`;
    }

    // リセットボタンのクリックイベントを設定
    document.getElementById('reset-button').addEventListener('click', () => {
        initializeBoard(); // ボードを初期化
        document.getElementById('pass-button').disabled = false; // パスボタンを有効化
    });

    // 自動モードボタンのクリックイベントを設定
    document.getElementById('auto-button').addEventListener('click', () => {
        autoMode = !autoMode; // 自動モードのオン/オフを切り替え
        updateAutoModeStatus(); // 自動モードのステータスを更新
        togglePassButton(); // パスボタンの状態を更新
        if (autoMode) { // 自動モードがオンの場合
            computerMove(); // コンピューターの動きを開始
        }
    });

    // 自動モードのステータスを更新する関数
    function updateAutoModeStatus() {
        const status = autoMode ? 'オン' : 'オフ'; // 自動モードの状態をテキストで取得
        document.querySelector('#auto-mode-status').textContent = `自動モード: ${status}`; // 画面に状態を表示
    }

    initializeBoard();
});    
    
