fn main() {
    let mut x = 5;
    let mut x = x + 1;

    {
        let x = x * 2;
        println!("Inner scope is: {x}");
    }
    println!("the outer scope value is: {x}");

}
