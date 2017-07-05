import React from 'react';
import { storiesOf } from '@storybook/react';
import Split from '../Split';

storiesOf('SplitPanel', module)
    .add('Testing', () => {
        return (
            <Split>
                <div> panel 1 </div>
                <div> panel 2 </div>
                <div> panel 3 </div>
                <div> panel 4 </div>
            </Split>
        )
    })