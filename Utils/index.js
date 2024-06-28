module.exports = {
  formatName(name) {
    let words = name.split(" ");
    let formattedName = words
      .map(word => {
        let firstLetterUpperCase = word.charAt(0).toUpperCase();
        let otherLettersLowerCase = word.slice(1).toLowerCase();
        return firstLetterUpperCase + otherLettersLowerCase;
      })
      .join(" ");

    return {
      formattedName: formattedName.trim()
    };
  }
}
