pub fn reverse(input: &str) -> String {
    input.chars().rev().collect()
}

#[test]
fn test() {
	assert_eq!(reverse("hello"), "olleh");
}
