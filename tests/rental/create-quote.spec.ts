// E2E spec for the "create rental quote" wizard: customer -> vehicle -> inspection -> recap.
// See https://github.com/mobile-next/mobilewright-skill and README.md for the mobilewright API.
import { test, expect } from '@mobilewright/test';

const WIZARD_ENTRY_DEEP_LINK = 'carrental:///rentals/new/customer';
const BUNDLE_ID = 'com.jessyv96.carrental';

test.use({ bundleId: BUNDLE_ID });

test.describe('create rental quote wizard', () => {
  test('blocks advancing past the customer step with an invalid email', async ({ device, screen }) => {
    // ARRANGE — fresh launch into the wizard's first step (customer info).
    await device.terminateApp(BUNDLE_ID).catch(() => {});
    await device.launchApp(BUNDLE_ID);
    await device.goto(WIZARD_ENTRY_DEEP_LINK);

    await screen.getByTestId('customer-step.first-name-field').fill('Jane');
    await screen.getByTestId('customer-step.last-name-field').fill('Doe');
    await screen.getByTestId('customer-step.phone-field').fill('555-0100');

    // ACT — enter a malformed email and attempt to advance.
    await screen.getByTestId('customer-step.email-field').fill('not-an-email');
    await screen.getByTestId('customer-step.next-button').tap();

    // ASSERT — the form's onChange validator keeps us on the customer step;
    // the email field (now dirty) is still visible because navigation never happened.
    await expect(screen.getByTestId('customer-step.email-field')).toBeVisible();
    await expect(screen.getByTestId('customer-step.first-name-field')).toBeVisible();
  });

  test('advances through all 4 steps and routes to accept-quote on confirm', async ({ device, screen }) => {
    // ARRANGE — fresh launch into the wizard's first step (customer info).
    await device.terminateApp(BUNDLE_ID).catch(() => {});
    await device.launchApp(BUNDLE_ID);
    await device.goto(WIZARD_ENTRY_DEEP_LINK);

    // ACT (step 1/4 — customer): fill required fields and capture license photos.
    await screen.getByTestId('customer-step.first-name-field').fill('Jane');
    await screen.getByTestId('customer-step.last-name-field').fill('Doe');
    await screen.getByTestId('customer-step.email-field').fill('jane.doe@example.com');
    await screen.getByTestId('customer-step.phone-field').fill('555-0100');

    // TODO(camera-permission): license photo capture (front + back) goes through
    // expo-camera's CameraView, gated by an OS-level camera permission dialog that
    // sits outside the app's own accessibility tree. Mobilewright's documented API
    // (see node_modules/mobilewright/README.md) has no permission pre-grant
    // mechanism (no equivalent of Appium's `autoGrantPermissions` / Detox's
    // `permissions` launch arg), so this step cannot be driven reliably from the
    // spec today. Best-effort sequence once a permission strategy exists:
    //   await screen.getByTestId('customer-step.take-license-photos-button').tap();
    //   await screen.getByTestId('customer-step.capture-photo-button').tap(); // front
    //   await screen.getByTestId('customer-step.capture-photo-button').tap(); // back
    // Flagging this explicitly rather than inventing an unsupported API.
    await screen.getByTestId('customer-step.take-license-photos-button').tap();
    await screen.getByTestId('customer-step.capture-photo-button').tap();
    await screen.getByTestId('customer-step.capture-photo-button').tap();

    await screen.getByTestId('customer-step.next-button').tap();

    // ACT (step 2/4 — vehicle + dates): pick a vehicle and a valid date range.
    await expect(screen.getByTestId('vehicle-step.vehicle-picker')).toBeVisible();
    await screen.getByTestId('vehicle-step.vehicle-picker').tap();
    await screen.getByTestId('vehicle-step.start-date-field').tap();
    await screen.getByTestId('vehicle-step.end-date-field').tap();
    await screen.getByTestId('vehicle-step.next-button').tap();

    // ACT (step 3/4 — inspection): mileage, fuel level, and a "before" photo.
    await expect(screen.getByTestId('inspection-step.mileage-field')).toBeVisible();
    await screen.getByTestId('inspection-step.mileage-field').fill('12000');
    await screen.getByTestId('inspection-step.fuel-level-slider').tap();

    // TODO(camera-permission): same OS permission-prompt caveat as above applies
    // to the "before" inspection photo capture.
    await screen.getByTestId('inspection-step.open-camera-button').tap();
    await screen.getByTestId('inspection-step.capture-photo-button').tap();

    await screen.getByTestId('inspection-step.next-button').tap();

    // ACT (step 4/4 — recap): confirm, which triggers PDF generation and routing.
    await expect(screen.getByTestId('recap-step.next-button')).toBeVisible();
    await screen.getByTestId('recap-step.next-button').tap();

    // ASSERT — successful submission generates the quote PDF and auto-routes to
    // the accept-quote screen; assert via a stable heading on that screen since
    // accept-quote's own testID instrumentation is out of scope here.
    await expect(screen.getByText('Quote acceptance')).toBeVisible({ timeout: 15_000 });
  });
});
