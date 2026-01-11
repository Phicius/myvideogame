import React, { FunctionComponent, useState, useEffect } from 'react';
import Pokemon from '../models/pokemon';
import PokemonCard from '../components/pokemon-card';
import PokemonService from '../services/pokemon-service';
import PokemonSearch from '../components/pokemon-search';
import {Link} from 'react-router-dom';
  
const PokemonList: FunctionComponent = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  
  useEffect(() => {
    PokemonService.getPokemons().then(pokemons => setPokemons(pokemons));
  }, []);
  
  return (
    <div>
      <h1 className="center">Jeux Vidéo</h1>
      <div className="container"> 
        <div className="row"> 
          <PokemonSearch />
        {pokemons.map(pokemon => (
          <PokemonCard key={pokemon.id} pokemon={pokemon}/>
        ))}
        </div>
        <Link className="btn-floating btn-large red right" to="/pokemons/add" 
        style={{position: 'fixed', bottom: '25px', right: '25px'}}
        >
          <i className="large material-icons">add</i>
        </Link>
      </div>
    </div> 
  );
}
  
export default PokemonList;