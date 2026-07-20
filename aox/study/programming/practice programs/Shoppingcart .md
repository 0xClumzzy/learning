This is a practice program 
[[Input]]
[[arithmetic]]
[[variables]]

- [ ] Get user input 
- [ ] calculate the total

Declare all the variables you will need to start
- The name of the item to be bought 
- The price

```c
#include <stdio.h>

int main() {
    // ===== VARIABLES: storing item prices =====
    float applePrice = 0.50;
    float breadPrice = 2.30;
    float milkPrice  = 1.80;
    float eggsPrice  = 3.25;
    float coffeePrice = 6.99;

    // ===== VARIABLES: quantities user will input =====
    int appleQty, breadQty, milkQty, eggsQty, coffeeQty;

    // ===== DISPLAY MENU =====
    printf("=====================================\n");
    printf("===========SHOPPING CART=============\n");
    printf("============ WELCOME =================\n");
    printf("=====================================\n");
    printf("%-5s %-15s %-10s\n", "No.", "Item", "Price");
    printf("=====================================\n");
    printf("1.   %-15s $%.2f\n", "Apple", applePrice);
    printf("2.   %-15s $%.2f\n", "Bread", breadPrice);
    printf("3.   %-15s $%.2f\n", "Milk", milkPrice);
    printf("4.   %-15s $%.2f\n", "Eggs (12)", eggsPrice);
    printf("5.   %-15s $%.2f\n", "Coffee", coffeePrice);
    printf("=====================================\n");

    // ===== USER INPUT: how many of each item =====
    printf("\nHow many Apples do you want? ");
    scanf("%d", &appleQty);

    printf("How many Bread do you want? ");
    scanf("%d", &breadQty);

    printf("How many Milk do you want? ");
    scanf("%d", &milkQty);

    printf("How many Eggs (dozens) do you want? ");
    scanf("%d", &eggsQty);

    printf("How many Coffee do you want? ");
    scanf("%d", &coffeeQty);

    // ===== ARITHMETIC: calculate cost per item =====
    float appleTotal  = appleQty * applePrice;
    float breadTotal  = breadQty * breadPrice;
    float milkTotal   = milkQty * milkPrice;
    float eggsTotal   = eggsQty * eggsPrice;
    float coffeeTotal = coffeeQty * coffeePrice;

    // ===== ARITHMETIC: grand total =====
    float grandTotal = appleTotal + breadTotal + milkTotal + eggsTotal + coffeeTotal;

    // ===== RECEIPT =====
    printf("\n=====================================\n");
    printf("=============== RECEIPT ==============\n");
    printf("=====================================\n");
    printf("%-15s x%-3d = $%.2f\n", "Apple", appleQty, appleTotal);
    printf("%-15s x%-3d = $%.2f\n", "Bread", breadQty, breadTotal);
    printf("%-15s x%-3d = $%.2f\n", "Milk", milkQty, milkTotal);
    printf("%-15s x%-3d = $%.2f\n", "Eggs (12)", eggsQty, eggsTotal);
    printf("%-15s x%-3d = $%.2f\n", "Coffee", coffeeQty, coffeeTotal);
    printf("=====================================\n");
    printf("GRAND TOTAL: $%.2f\n", grandTotal);
    printf("=====================================\n");

    return 0;
}
```