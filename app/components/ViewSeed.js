// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ActionButtons from '../containers/ActionButtons'
import Button from '../containers/Button'
import Blob from '../components/Blob'
import Input from '../components/Input'

type Props = {};

export default class ViewSeedView extends Component<Props> {
  props: Props;

  render() {

    const { 
      seed 
    } = this.props

    return (
      <div>
        {seed && 
          <div>
            <p>
              Please record your seed phrase
            </p>
            <Blob fontSize={16}>
              {seed}
            </Blob>
            <Input.SmallText>
              Make sure to keep this information in a safe place. Your seed phrase gives you access to your Stacks. You will only be able to view this once.
            </Input.SmallText>
            <ActionButtons>
              <Button onClick={this.props.back}>Back</Button>
              <Button onClick={this.props.next}>Next</Button>
            </ActionButtons>
          </div>
        }
      </div>
    );
  }
}