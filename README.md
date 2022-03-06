# guessing.game
Guessing game in java

Implement CLI guessing game. 
- Program chooses a random secret number with 4 digits.
- All digits in the secret number are different.
- Player has 8 tries to guess the secret number.
- After each guess program displays the message "M:m; P:p" where:
  - m - number of matching digits which are not on the right place
  - p - number of matching digits in the right place
- Game ends after 8 tries or if the correct number is guessed.  

Samples:

Secret:  **7046**
Guess:   **8724**
Message: **M:2; P:0**

Secret:  **7046**
Guess:   **7842**
Message: **M:0; P:2**

Secret:  **7046**
Guess:   **7640**
Message: **M:2; P:2**
