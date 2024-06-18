document.addEventListener('DOMContentLoaded', function () {
    const boardSize = 10;
    const products = [
        '🍎', '🍌', '🍇', '🍒', '🍑', '🍍', '🥥', '🥝', '🍅', '🥑',
        '🥕', '🌽', '🍆', '🍔', '🍕', '🍟', '🍣', '🍿', '🥐', '🍪'
    ];
    const productLimit = 5;
    let productCounts = {};

    function initializeProductCounts() {
        products.forEach(product => productCounts[product] = 0);
    }

    let currentPlayer = 'player';
    let selectedProduct = '';
    let board = Array(boardSize).fill().map(() => Array(boardSize).fill(null));
    let moves = 0;
    let restartCount = 0;

    const gameBoard = document.getElementById('game-board');
    const productSelection = document.getElementById('product-selection');
    const resultMessage = document.getElementById('result-message');
    const restartBtn = document.getElementById('restart-btn');

    function initializeBoard() {
        gameBoard.innerHTML = '';
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', onCellClick);
                gameBoard.appendChild(cell);
            }
        }
    }

    function initializeProductSelection() {
        productSelection.innerHTML = '';
        products.forEach(product => {
            const button = document.createElement('button');
            button.classList.add('product-button');
            button.textContent = product;
            button.dataset.product = product;
            button.addEventListener('click', () => selectProduct(product));
            productSelection.appendChild(button);
        });
    }

    function selectProduct(product) {
        if (productCounts[product] >= productLimit) {
            return;
        }
        selectedProduct = product;
        document.querySelectorAll('.product-button').forEach(button => {
            button.classList.remove('selected');
        });
        event.target.classList.add('selected');
    }

    function onCellClick(event) {
        if (selectedProduct === '' || productCounts[selectedProduct] >= productLimit) return;

        const row = event.target.dataset.row;
        const col = event.target.dataset.col;

        if (board[row][col] !== null) return;

        board[row][col] = selectedProduct;
        moves++;
        productCounts[selectedProduct]++;
        event.target.innerHTML = `<div class="product-icon">${selectedProduct}</div>`;
        
        if (productCounts[selectedProduct] >= productLimit) {
            disableProduct(selectedProduct);
        }

        if (checkWin(row, col)) {
            showMessage(`עשה צילום מסך עכשיו וגש לאחד מסניפי היפר כהן וקבל הנחה שווה <span class="icon-phone">📱</span>`, 'win');
        } else if (moves >= boardSize * boardSize) {
            showMessage('לא נורא, אולי בפעם הבאה', 'lose');
        } else {
            currentPlayer = 'computer';
            computerMove();
        }
    }

    function computerMove() {
        let moveMade = false;

        // Try to block player from winning (five in a row)
        if (!moveMade) {
            for (let i = 0; i < boardSize; i++) {
                for (let j = 0; j < boardSize; j++) {
                    if (board[i][j] === null) {
                        board[i][j] = selectedProduct;
                        if (checkWin(i, j)) {
                            board[i][j] = null;
                            let product = getRandomProduct();
                            board[i][j] = product;
                            productCounts[product]++;
                            updateCell(i, j);
                            moves++;
                            moveMade = true;
                            break;
                        }
                        board[i][j] = null;
                    }
                }
                if (moveMade) break;
            }
        }

        // Try to block player from getting five in a row by blocking four, three or two in a row
        if (!moveMade) {
            for (let i = 0; i < boardSize; i++) {
                for (let j = 0; j < boardSize; j++) {
                    if (board[i][j] === null) {
                        board[i][j] = selectedProduct;
                        if (checkPotentialWin(i, j, 4) || checkPotentialWin(i, j, 3) || checkPotentialWin(i, j, 2)) {
                            board[i][j] = null;
                            let product = getRandomProduct();
                            board[i][j] = product;
                            productCounts[product]++;
                            updateCell(i, j);
                            moves++;
                            moveMade = true;
                            break;
                        }
                        board[i][j] = null;
                    }
                }
                if (moveMade) break;
            }
        }

        // Make a random move
        if (!moveMade) {
            let emptyCells = [];
            for (let i = 0; i < boardSize; i++) {
                for (let j = 0; j < boardSize; j++) {
                    if (board[i][j] === null) {
                        emptyCells.push({ row: i, col: j });
                    }
                }
            }
            const randomMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            let product = getRandomProduct();
            board[randomMove.row][randomMove.col] = product;
            productCounts[product]++;
            updateCell(randomMove.row, randomMove.col);
            moves++;
        }

        currentPlayer = 'player';
    }

    function getRandomProduct() {
        let availableProducts = products.filter(product => productCounts[product] < productLimit);
        if (availableProducts.length === 0) {
            return null;
        }
        return availableProducts[Math.floor(Math.random() * availableProducts.length)];
    }

    function checkPotentialWin(row, col, targetCount) {
        return checkDirection(row, col, 1, 0, targetCount) || // Horizontal
            checkDirection(row, col, 0, 1, targetCount) || // Vertical
            checkDirection(row, col, 1, 1, targetCount) || // Diagonal
            checkDirection(row, col, 1, -1, targetCount);  // Anti-Diagonal
    }

    function updateCell(row, col) {
        const cell = gameBoard.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
        cell.innerHTML = `<div class="product-icon">${board[row][col]}</div>`;
    }

    function checkWin(row, col) {
        return checkDirection(row, col, 1, 0, 4) || // Horizontal
            checkDirection(row, col, 0, 1, 4) || // Vertical
            checkDirection(row, col, 1, 1, 4) || // Diagonal
            checkDirection(row, col, 1, -1, 4);  // Anti-Diagonal
    }

    function checkDirection(row, col, rowDir, colDir, targetCount) {
        let count = 1;
        for (let i = 1; i <= targetCount; i++) {
            const r = parseInt(row) + rowDir * i;
            const c = parseInt(col) + colDir * i;
            if (r < 0 || r >= boardSize || c < 0 || c >= boardSize || board[r][c] !== board[row][col]) break;
            count++;
        }
        for (let i = 1; i <= targetCount; i++) {
            const r = parseInt(row) - rowDir * i;
            const c = parseInt(col) - colDir * i;
            if (r < 0 || r >= boardSize || c < 0 || c >= boardSize || board[r][c] !== board[row][col]) break;
            count++;
        }
        return count > targetCount;
    }

    function disableProduct(product) {
        const buttons = document.querySelectorAll(`.product-button[data-product="${product}"]`);
        buttons.forEach(button => {
            button.disabled = true;
            button.classList.add('disabled');
        });
    }

    function showMessage(message, type) {
        resultMessage.innerHTML = message;
        resultMessage.classList.remove('hidden');
        resultMessage.classList.add(type === 'win' ? 'win' : 'lose');
        if (type === 'win') {
            restartBtn.style.display = 'none';
        } else {
            restartBtn.style.display = 'block';
        }
    }

    function resetGame() {
        board = Array(boardSize).fill().map(() => Array(boardSize).fill(null));
        moves = 0;
        selectedProduct = '';
        currentPlayer = 'player';
        initializeProductCounts();
        resultMessage.classList.add('hidden');
        restartCount++;
        initializeBoard();
        initializeProductSelection();
        restartBtn.style.display = 'block';
    }

    restartBtn.addEventListener('click', resetGame);

    initializeProductCounts();
    initializeBoard();
    initializeProductSelection();
});
