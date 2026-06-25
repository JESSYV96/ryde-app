import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Colors, Radius } from '@/shared/ui/theme';

export interface SignaturePadRef {
  clear: () => void;
  exportAsPng: () => Promise<string>;
}

interface SignaturePadProps {
  onChange: (hasContent: boolean) => void;
  testID?: string;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(({ onChange, testID }, ref) => {
  const strokesRef = useRef<string[]>([]);
  const currentStrokeRef = useRef('');
  const svgRef = useRef<Svg>(null);
  const [, forceRender] = useState(0);

  const rerender = () => forceRender((tick) => tick + 1);

  const handleBegin = (x: number, y: number) => {
    currentStrokeRef.current = `M${x},${y}`;
    rerender();
  };

  const handleUpdate = (x: number, y: number) => {
    currentStrokeRef.current += ` L${x},${y}`;
    rerender();
  };

  const handleEnd = () => {
    if (currentStrokeRef.current) {
      strokesRef.current = [...strokesRef.current, currentStrokeRef.current];
      currentStrokeRef.current = '';
      onChange(true);
      rerender();
    }
  };

  // Gesture.Pan() callbacks run as worklets on the UI thread (react-native-reanimated
  // is installed), so JS state updates must be marshalled back via runOnJS.
  const panGesture = Gesture.Pan()
    .minDistance(0)
    .onBegin((event) => {
      runOnJS(handleBegin)(event.x, event.y);
    })
    .onUpdate((event) => {
      runOnJS(handleUpdate)(event.x, event.y);
    })
    .onEnd(() => {
      runOnJS(handleEnd)();
    });

  useImperativeHandle(ref, () => ({
    clear: () => {
      strokesRef.current = [];
      currentStrokeRef.current = '';
      onChange(false);
      rerender();
    },
    exportAsPng: () =>
      new Promise<string>((resolve) => {
        svgRef.current?.toDataURL((base64) => resolve(base64));
      }),
  }));

  return (
    <View style={styles.container} testID={testID}>
      <GestureDetector gesture={panGesture}>
        <Svg ref={svgRef} style={styles.svg}>
          {strokesRef.current.map((d, index) => (
            <Path
              key={index}
              d={d}
              stroke={Colors.light.text}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentStrokeRef.current ? (
            <Path
              d={currentStrokeRef.current}
              stroke={Colors.light.text}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </Svg>
      </GestureDetector>
    </View>
  );
});

SignaturePad.displayName = 'SignaturePad';

const styles = StyleSheet.create({
  container: {
    height: 220,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.backgroundElement,
    overflow: 'hidden',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
});
