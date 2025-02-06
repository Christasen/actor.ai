const pdfParse = require('pdf-parse');

class PDFParser {
  static async extractActorInfo(buffer) {
    try {
      const data = await pdfParse(buffer);
      const text = data.text;
      
      // This is a basic implementation - you'll need to adjust the parsing logic
      // based on your PDF structure
      const sections = text.split('\n\n').filter(Boolean);
      
      // Example parsing logic - adjust based on your PDF format
      const actorInfo = {
        name: this.extractField(sections, 'Name:'),
        birthplace: this.extractField(sections, 'Birthplace:'),
        birthday: this.extractField(sections, 'Birthday:'),
        bio: this.extractField(sections, 'Biography:'),
        movies: this.extractMovies(sections)
      };

      return actorInfo;
    } catch (error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  static extractField(sections, fieldName) {
    const section = sections.find(s => s.startsWith(fieldName));
    return section ? section.replace(fieldName, '').trim() : '';
  }

  static extractMovies(sections) {
    const movieSection = sections.find(s => s.startsWith('Filmography:'));
    if (!movieSection) return [];

    const movieList = movieSection
      .replace('Filmography:', '')
      .trim()
      .split('\n')
      .filter(Boolean);

    return movieList.map(movie => {
      const [title, role] = movie.split(' - ').map(s => s.trim());
      return { title, role };
    });
  }
}

module.exports = PDFParser; 