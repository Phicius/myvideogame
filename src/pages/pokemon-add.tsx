import React , { FunctionComponent, useState } from 'react';
import { useHistory } from 'react-router-dom';  
import Pokemon from '../models/pokemon';
import PokemonForm from '../components/pokemon-form';
import formatType from '../helpers/format-type';
import PokemonService from '../services/pokemon-service';

const PokemonAdd : FunctionComponent = () => {
    const [id] = useState<number>(new Date().getTime());
    const [pokemon] = useState<Pokemon>(new Pokemon(id));

    return (
        <div className = "row">
            <h2 className="header center">Ajouter un Pokémon</h2>
            <PokemonForm pokemon={pokemon} isEditForm={false}></PokemonForm>
        </div>
    );
}


export default PokemonAdd;
