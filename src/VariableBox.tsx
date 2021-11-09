import * as React from 'react';
import { Animated } from 'react-animated-css';

interface Props {
    variableName: string;
    colorOrder: number;
    variableValue: number | string | boolean | null | undefined;
    indexLabel?: number | string;
    isCurrentIdentifier?: boolean;
}

interface State {
    isComponentVisible: boolean;
    isBoxVisible: boolean;
}

class VariableBox extends React.Component<Props, State> {
    static defaultProps = {
        isCurrentIdentifier: false
    };
    static backgrounds = [
        '#F3F2F9',
        '#F3F2F9',
        '#F3F2F9'
    ];

    constructor(props: Props) {
        super(props);

        this.state = {
            isComponentVisible: true,
            isBoxVisible: true
        };
    }
    triggetOutAnimation() {
        this.setState({
            isComponentVisible: false
        });
    }

    toggleAnimation() {
        this.setState({
            isBoxVisible: !this.state.isBoxVisible
        });
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.variableValue !== nextProps.variableValue) {
            this.toggleAnimation();
        }
    }

    componentWillUnmount() {
        setTimeout(() => this.triggetOutAnimation(), 500);
    }

    render() {
        return (
            <Animated
                animationIn="bounceInRight"
                animationOut="bounceOutRight"
                isVisible={this.state.isComponentVisible}
            >
                <Animated
                    animationIn="flipInX"
                    animationOut="flipInY"
                    animateOnMount={false}
                    isVisible={this.state.isBoxVisible}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minWidth: 25,
                            height: 25,
                            borderRadius: 7,
                            padding: 10,
                            marginLeft: 3,
                            marginRight: 3,
                            color: '#948E96',
                            borderImageSlice: 1,
                            textAlign: 'center',
                            fontWeight: 700,
                            boxShadow: "1px 3px 6px -1px #AAAAAA",
                            background: VariableBox.backgrounds[
                                this.props.colorOrder % VariableBox.backgrounds.length
                            ]
                        }}
                    >
                        {`${this.props.variableValue}`}
                    </div>
                </Animated>
                <div
                    style={{
                        fontFamily: "'Fira Code', monospace !important",
                        fontWeight: 300 /* this.props.isCurrentIdentifier ? 'bold' : 'normal' */,
                        textAlign: 'center'
                    }}
                >
                    <span
                        className="box-label btn p-1 shadow-sm"
                        style={{
                            color: '#948E96',
                            fontWeight: 700,
                            fontFamily: "'Fira Code', monospace !important;",
                            textAlign: 'center'
                        }}
                    >
                        {this.props.variableName}<sub>{this.props.indexLabel}</sub>
                    </span>
                </div>
            </Animated>
        );
    }
}

export default VariableBox;