const express = require("express");
const { open } = require("sqlite");

const path = require("path");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB ERROR :${e.message}`);
    process.exit(1);
  }
};
initializeDbServer();

//get movie names
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
     movie_name
    FROM 
      movie;`;
  const movieArray = await db.all(getMoviesQuery);

  function convert(name) {
    return { movieName: name.movie_name };
  }

  const newMovieArray = movieArray.map(convert);
  response.send(newMovieArray);
});

//Add New Movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
  INSERT INTO
    movie (director_id, movie_name, lead_actor)
  VALUES
   (
    '${directorId}',
    '${movieName}',
    '${leadActor}'
   );`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Get a Particular Movie

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
  SELECT 
    *
  FROM 
    movie
  WHERE 
    movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  const movie1 = {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  };
  response.send(movie1);
});

// update movie details
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovie = `
     UPDATE 
       movie
     SET 
       director_id = ${directorId},
       movie_name = '${movieName}',
       lead_actor = '${leadActor}'
     WHERE 
       movie_id = ${movieId};
  `;
  const updatedMovie = await db.run(updateMovie);
  response.send("Movie Details Updated");
});

// delete a book

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
      DELETE FROM
       movie
      WHERE 
       movie_id = ${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

// get directors
app.get("/directors/", async (request, response) => {
  const getDirectors = `
       SELECT * 
       FROM 
       director
    `;
  const directors = await db.all(getDirectors);

  function convert(directorDetails) {
    return {
      directorId: directorDetails.director_id,
      directorName: directorDetails.director_name,
    };
  }
  const directors1 = directors.map(convert);

  response.send(directors1);
});

//get specific movies of director

app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  const directorMovies = `
      SELECT 
        movie_name
      FROM 
        movie
      INNER JOIN director
        ON movie.director_id = director.director_id
      WHERE movie.director_id = ${directorId}; 
    `;
  const movies = await db.all(directorMovies);
  function convert(name) {
    return { movieName: name.movie_name };
  }

  const newMovieArray = movies.map(convert);
  response.send(newMovieArray);
});

module.exports = app;
