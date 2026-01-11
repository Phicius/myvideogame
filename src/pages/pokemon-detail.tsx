import React, { FunctionComponent, useState, useEffect } from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import Pokemon from '../models/pokemon';
import PokemonService from '../services/pokemon-service';
import TicTacToe from '../components/tictactoe';
  
type Params = { id: string };
  
const PokemonsDetail: FunctionComponent<RouteComponentProps<Params>> = ({ match }) => {
    
  const [pokemon, setPokemon] = useState<Pokemon|null>(null);
  
  useEffect(() => {
    PokemonService.getPokemon(+match.params.id).then(pokemon => {
      if (pokemon) setPokemon(pokemon);
    });
  }, [match.params.id]);
    
  return (
    <div className="container" style={{marginTop: '30px', marginBottom: '30px'}}>
      <Link to="/" className="btn" style={{marginBottom: '20px'}}>
        <i className="material-icons left">arrow_back</i>Retour
      </Link>
      
      { pokemon ? (
        <div style={{textAlign: 'center'}}>
          <h2>{ pokemon.name }</h2>
          <img src={pokemon.picture} alt={pokemon.name} style={{width: '150px', margin: '20px auto', display: 'block'}}/>
          
          {pokemon.name === 'Morpion' && <TicTacToe />}
        </div>
      ) : (
        <h4 className="center">Chargement...</h4>
      )}
    </div>
  );
}
  
export default PokemonsDetail;